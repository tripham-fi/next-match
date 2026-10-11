"use client";

import { getPusherClient } from "@/lib/pusher-client";
import { MessageDto } from "@/lib/types";
import { Channel } from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";

type Props = {
  initialMessages: MessageDto[];
  currentUserId: string;
  chatId: string;
};

export default function MessageList({
  chatId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const channelRef = useRef<Channel | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((message: MessageDto) => {
    setMessages((prev) => {
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = getPusherClient().subscribe(chatId);
      channelRef.current.bind("message:new", handleNewMessage);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [chatId, handleNewMessage]);
  return (
    <div className="flex-1 overflow-y-auto ">
      {messages?.length === 0 ? (
        <p>No message yet. Start the conversation</p>
      ) : (
        <>
          {messages?.map((message) => (
            <MessageBox
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))}
        </>
      )}
      <div ref={messageEndRef} />
    </div>
  );
}
