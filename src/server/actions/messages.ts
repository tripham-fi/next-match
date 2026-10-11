"use server";

import { chatSchema, ChatSchema } from "@/lib/schemas/chatSchema";
import { ActionResult } from "@/lib/types";
import { Message } from "../../../generated/prisma/client";
import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mapMessageToMessageDto } from "@/lib/mapping";
import { handlePrismaError } from "@/lib/util";

export async function createMessage(
  recipientUserId: string,
  data: ChatSchema,
): Promise<ActionResult<Message>> {
  try {
    const user = await requireAuthUser();

    const validated = chatSchema.safeParse(data);

    if (!validated.success)
      return { status: "error", error: validated.error.issues[0].message };

    const { text } = validated.data;

    const message = await prisma.message.create({
      data: {
        text,
        recipientId: recipientUserId,
        senderId: user.id,
      },
    });

    revalidatePath(`/members/${recipientUserId}/chat`);

    return { status: "success", data: message };
  } catch (err) {
    return handlePrismaError(err);
  }
}

export async function getMessageThread(recipientId: string) {
  try {
    const user = await requireAuthUser();

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          // Messages of current logged user
          {
            senderId: user.id,
            recipientId: recipientId,
            senderDeleted: false,
          },
          {
            // Messages of other user
            senderId: recipientId,
            recipientId: user.id,
            recipientDeleted: false,
          },
        ],
      },
      orderBy: {
        created: "asc",
      },
      select: messageSelect,
    });

    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          senderId: recipientId,
          recipientId: user.id,
          dateRead: null,
        },
        data: { dateRead: new Date() },
      });
    }

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getMessagesByContainer(container: string) {
  try {
    const user = await requireAuthUser();

    const conditions = {
      [container === "outbox" ? "senderId" : "recipientId"]: user.id,
      ...(container === "outbox"
        ? { senderDeleted: false }
        : { recipientDeleted: false }),
    };

    const messages = await prisma.message.findMany({
      where: conditions,
      select: messageSelect,
      orderBy: { created: "desc" },
    });

    return messages.map((message) => mapMessageToMessageDto(message));
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function deleteMessage(
  messageId: string,
  isOutbox: boolean,
): Promise<ActionResult<void>> {
  const selector = isOutbox ? "senderDeleted" : "recipientDeleted";

  try {
    const user = await requireAuthUser();

    await prisma.message.update({
      where: { id: messageId },
      data: {
        [selector]: true,
      },
    });

    // Retrieve list of messages that both party deleted
    const messagesToDelete = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
            senderDeleted: true,
            recipientDeleted: true,
          },
          {
            recipientId: user.id,
            senderDeleted: true,
            recipientDeleted: true,
          },
        ],
      },
    });

    if (messagesToDelete.length > 0) {
      await prisma.message.deleteMany({
        where: {
          OR: messagesToDelete.map((m) => ({ id: m.id })),
        },
      });
    }

    revalidatePath(`/members/${user.id}/chat`);
    revalidatePath("/messages");

    return { status: "success", data: undefined };
  } catch (err) {
    console.log(err);
    return handlePrismaError(err);
  }
}

const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  sender: {
    select: {
      userId: true,
      name: true,
      image: true,
    },
  },
  recipient: {
    select: {
      userId: true,
      name: true,
      image: true,
    },
  },
};
