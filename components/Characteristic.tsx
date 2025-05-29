'use client'

import { ChatbotCharacteristic } from "@/types/types"
import { OctagonX } from "lucide-react";
import { useMutation } from "@apollo/client";
import React from 'react';
import { REMOVE_CHARACTERISTIC } from "@/graphql/mutations/mutations";
import { toast } from "sonner";

export default function Characteristic({characteristic}: {
  characteristic: ChatbotCharacteristic
}) {
  const [removeCharacteristic] = useMutation(REMOVE_CHARACTERISTIC,{
    refetchQueries: ["GetChatbotById"],
    variables:{
      characteristicId: characteristic.id
    }
  })

  const handleRemoveCharacteristic = async (characteristicId: number) => {
    try {
      await removeCharacteristic({
        variables: {
          id: characteristicId,
        },
      });
    } catch (error){
      console.error(error)
    }
  }
  return (
    <li key={characteristic.id} className="relative p-10 bg-white border rounded-md">
      {characteristic.content}

      <OctagonX
        className="w-6 h-6 text-white fill-red-500 absolute top-1 right-1 cursor-pointer hover:opacity-50"
        onClick={() => {
          const promise = handleRemoveCharacteristic(characteristic.id);
          toast.promise(promise, {
            loading: "Removing...",
            success: "Characteristic remove",
            error: "Failed to remove characteristic",
          })
        }}
      />
    </li>
  )
}