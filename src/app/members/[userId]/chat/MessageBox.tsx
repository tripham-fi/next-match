"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { MessageDto } from "@/lib/types";
import { formatShortDate, timeAgo, transformImageUrl } from "@/lib/util";
import { Avatar } from "@heroui/react";
import clsx from "clsx";

type Props = {
  message: MessageDto;
  currentUserId?: string;
};
export default function MessageBox({ message, currentUserId }: Props) {
  const isCurrentUserSender = message.senderId === currentUserId;

  const renderAvatar = () => (
    <div className="self-end">
      <PresenceAvatar
        src={message.senderImage}
        userId={message.senderId}
        name={message.senderName}
      />
    </div>
  );
  return (
    <div className="grid grid-rows-1">
      <div
        className={clsx("flex gap-2 mb-3 mr-2", {
          "justify-end text-right": isCurrentUserSender,
          "justify-start": !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}
        <div
          className={clsx("flex flex-col w-[50%] px-2 py-1", {
            "rounded-l-xl rounded-tr-xl text-white bg-blue-100":
              isCurrentUserSender,
            "rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100":
              !isCurrentUserSender,
          })}
        >
          <div
            className={clsx("flex items-center w-full", {
              "justify-between": isCurrentUserSender,
            })}
          >
            {message.dateRead && message.recipientId !== currentUserId ? (
              <span className="text-xs text-black italic">
                (Read {timeAgo(message.dateRead)})
              </span>
            ) : (
              <div></div>
            )}

            <div className="flex">
              <span className="text-sm font-semibold text-gray-900">
                {message.senderName}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                {formatShortDate(new Date(message.created))}
              </span>
            </div>
          </div>
          <p className="text-sm py-3 text-gray-900">{message.text}</p>
        </div>
        {isCurrentUserSender && renderAvatar()}
      </div>
    </div>
  );
}
