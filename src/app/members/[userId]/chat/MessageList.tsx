"use client";

import { getPusherClient } from "@/lib/pusher-client";
import { MessageDto } from "@/lib/types";
import { Channel } from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import { markedMessageAsRead } from "@/server/actions/messages";
import { useMessageStore } from "@/lib/hooks/useMessageStore";
import ChatForm from "./ChatForm";
import { Chip } from "@heroui/react";
import { User } from "better-auth";

type Props = {
  initialMessages: MessageDto[];
  currentUser: User;
  chatId: string;
  readCount: number;
};

export default function MessageList({
  chatId,
  currentUser,
  initialMessages,
  readCount,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const channelRef = useRef<Channel | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const countUpdated = useRef(false);
  const [typingName, setTypingName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback((name: string) => {
    setIsTyping(true);
    setTypingName(name);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, []);

  const handleNewMessage = useCallback(
    async (message: MessageDto) => {
      setMessages((prev) => {
        return [...prev, message];
      });

      if (message.senderId !== currentUser.id) {
        await markedMessageAsRead([message.id], message.senderId);
      }
    },
    [currentUser],
  );

  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prev) =>
      prev.map((message) =>
        messageIds.includes(message.id)
          ? { ...message, dateRead: new Date().toISOString() }
          : message,
      ),
    );
  }, []);

  useEffect(() => {
    if (!countUpdated.current) {
      updateUnreadCount(-readCount);
      countUpdated.current = true;
    }
  }, [readCount, updateUnreadCount]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = getPusherClient().subscribe(chatId);
      channelRef.current.bind("message:new", handleNewMessage);
      channelRef.current.bind("messages:read", handleReadMessages);
      channelRef.current.bind("client-typing", handleTyping);
    }

    return () => {
      // cleanup
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind_all();
        channelRef.current = null;
      }
    };
  }, [chatId, handleNewMessage, handleReadMessages, handleTyping]);

  const triggetTyping = () => {
    if (channelRef.current) {
      channelRef.current.trigger("client-typing", currentUser.name);
    }
  };
  return (
    <div className="relative flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto ">
        {messages?.length === 0 ? (
          <p>No message yet. Start the conversation</p>
        ) : (
          <>
            {messages?.map((message) => (
              <MessageBox
                key={message.id}
                message={message}
                currentUserId={currentUser.id}
              />
            ))}
          </>
        )}
        <div ref={messageEndRef} />
      </div>
      {isTyping && (
        <Chip
          color="accent"
          variant="secondary"
          className="w-fit rounded-md absolute bottom-14"
        >
          {typingName} is typing...
        </Chip>
      )}
      <ChatForm triggerTyping={triggetTyping} />
    </div>
  );
}
