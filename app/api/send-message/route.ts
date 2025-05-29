import { INSERT_MESSAGE } from "@/graphql/mutations/mutations";
import {
  GET_CHATBOT_BY_ID,
  GET_MESSAGES_BY_CHAT_SESSION_ID,
} from "@/graphql/queries/queries";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name } = await req.json();

  console.log(
    `Received message from chat session ${chat_session_id}: ${content} (chatbot: ${chatbot_id})`
  );

  try {
    // Step 1: Fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }
    // Step 2: Fetch previous messages
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });

    const previousMessages = messagesData.chat_sessions.messages;

    const formattedPreviousMessages: ChatCompletionMessageParam[] =
      previousMessages.map((message) => ({
        role: message.sender === "ai" ? "system" : "user",
        name: message.sender === "ai" ? "system" : name,
        content: message.content,
      }));

    // Combine characteristics into a system prompt
    const systemPrompt = chatbot.chatbot_characteristics
      .map((c) => c.content)
      .join(" + ");

    console.log(systemPrompt);

    function sanitizeName(name: string) {
      // Remove invalid characters and replace spaces with underscores
      return name.replace(/[<|\\/>]/g, "").replace(/\s+/g, "_") || "user";
    }

    const safeName = sanitizeName(name);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        name: "system",
        content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not relevant or in the same scope or domain as the points in mentioned in the key information section, kindly inform the user they're only allowed to search for the specified content. Use emojis where possible. Here is some key information that you need to be aware of, these are elements you may be asked about: ${systemPrompt}`,
      },
      ...formattedPreviousMessages,
      {
        role: "user",
        name: safeName,
        content: content,
      },
    ];

    // Send the message to OpenAI's completions API
    const openaiResponse = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4o",
    });

    if (!openaiResponse) {
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 500 }
      );
    }

    // Save the user's message in the database
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content,
        sender: "user",
        created_at: new Date().toISOString(),
      },
    });

    // Extract the actual message content from the OpenAI response
    const aiContent =
      openaiResponse.choices?.[0]?.message?.content || "No response";

    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        content: aiContent,
        sender: "ai",
        created_at: new Date().toISOString(),
      },
    });

    console.log("AI Message Mutation Result:", aiMessageResult);

    return NextResponse.json({
      id: aiMessageResult.data.insertMessages.id,
      content: aiContent,
    });
  } catch (error) {
    console.error("Error sending message: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
