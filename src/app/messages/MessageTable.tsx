"use client";

import { MessageDto } from "@/lib/types";
import { transformImageUrl } from "@/lib/util";
import { Avatar, Button, Table } from "@heroui/react";
import { useRouter } from "next/navigation";
import { AiFillDelete } from "react-icons/ai";

type Props = {
  messages: MessageDto[];
  container: string;
};

export default function MessageTable({ messages, container }: Props) {
  const router = useRouter();
  const isOutbox = container === "outbox";
  const partyLabel = isOutbox ? "Recipient" : "Sender";

  return (
    <Table>
      <Table.ScrollContainer className="max-h-[65vh] overflow-y-auto">
        <Table.Content aria-label="Message table">
          <Table.Header>
            <Table.Column id="party" isRowHeader>
              {partyLabel}
            </Table.Column>
            <Table.Column id="text">Message</Table.Column>
            <Table.Column id="created">Date</Table.Column>
            <Table.Column id="actions">{"Actions"}</Table.Column>
          </Table.Header>
          <Table.Body
            items={messages}
            renderEmptyState={() => "No message to display"}
          >
            {(message) => {
              const name = isOutbox
                ? message.recipientName
                : message.senderName;
              const image = isOutbox
                ? message.recipientImage
                : message.senderImage;
              const partyId = isOutbox ? message.recipientId : message.senderId;

              return (
                <Table.Row
                  id={message.id}
                  onAction={() => router.push(`/members/${partyId}/chat`)}
                  className="cursor-pointer"
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <Avatar.Image
                          alt={name}
                          src={transformImageUrl(image) || "/images/user.png"}
                        />
                        <span>{name}</span>
                      </Avatar>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="line-clamp-1">{message.text}</span>
                  </Table.Cell>
                  <Table.Cell>{message.created}</Table.Cell>
                  <Table.Cell>
                    <div onPointerDown={(e) => e.stopPropagation()}>
                      <Button
                        isIconOnly
                        variant="danger-soft"
                        aria-label="Delete Message"
                      >
                        <AiFillDelete size={18} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            }}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
