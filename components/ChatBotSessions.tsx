'use client'

import { Chatbot } from "@/types/types"
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Avatar from "./Avatar";
import Link from "next/link";
import ReactTimeago from "react-timeago";


export default function ChatBotSessions({chatbots}: {chatbots: Chatbot[]}) {
    const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);

    useEffect(() => {
        const sortedArray = [...chatbots].sort(
            (a, b) => b.chat_sessions.length - a.chat_sessions.length 
        );
    })
  return (
    <div className="bg-white">
        <Accordion type="single" collapsible>
            {sortedChatbots.map((chatbot) => {
                const hasSessions = chatbot.chat_sessions.length > 0;

                return (
                    <AccordionItem key={chatbot.id} value={`item-${chatbot.id}`} className="px-10 py-5">
                        {hasSessions? (
                            <>
                             <AccordionTrigger>
                                <div className="flex text-left items-center w-full">
                                    <Avatar seed={chatbot.name} className="h-10 w-10 mr-4"/>
                                    <div className="flex flex-1 justify-between space-x-4">
                                        <p>{chatbot.name}</p>
                                        <p className="pr-4 font-bold text-right">
                                            {chatbot.chat_sessions.length} sessions 
                                        </p>
                                    </div>
                                </div>

                             </AccordionTrigger>
                             <AccordionContent>
                                {chatbot.chat_sessions.map((session) => (
                                    <Link href={`/review-sessions/${session.id}`} key={session.id} className="relative p-10 bg-[#2991EE] text-white rounded-md block">
                                        <p className="text-lg font-bold">
                                            {session.guests?.name || "Anonymous"}
                                        </p>
                                        <p>
                                            {session.guests?.email || "No email password"}
                                        </p>
                                        <p>
                                            <ReactTimeago date={new Date(session.created_at)}/>
                                        </p>
                                    </Link>
                                ))}
                             </AccordionContent>
                            </>
                        ) : (
                            <p className="font-light">{chatbot.name} (No sessions)</p>
                        )}
                    </AccordionItem>
                );
            })}    
        </Accordion>
    </div>
  )
}