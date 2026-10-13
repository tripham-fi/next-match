"use server";

import { requireAuthUser } from "@/lib/auth";
import { mapLikeToLikeSourceDto } from "@/lib/mapping";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

export async function toggleLikeMember(targetUserId: string, isLiked: boolean) {
  try {
    const user = await requireAuthUser();

    if (isLiked) {
      // delete like
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: user.id,
            targetUserId, // same as targetUserId: targetUserId
          },
        },
      });
    } else {
      // create like
      const like = await prisma.like.create({
        data: { sourceUserId: user.id, targetUserId },
        select: {
          sourceMember: {
            select: {
              userId: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const likeDto = mapLikeToLikeSourceDto(like);

      // in realtime, notify other user that you like them
      await pusherServer.trigger(
        `private-${targetUserId}`,
        "like:new",
        likeDto,
      );
    }

    revalidatePath("/members");
    revalidatePath(`/members/${targetUserId}`);
  } catch (err) {
    console.log(err);
  }
}

export async function fetchCurrentUserLikeIds() {
  try {
    const user = await requireAuthUser();

    const likes = await prisma.like.findMany({
      where: {
        sourceUserId: user.id,
      },
      select: {
        targetUserId: true,
      },
    });

    return likes.map((like) => like.targetUserId);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function fetchLikedMembers(type = "target") {
  try {
    const user = await requireAuthUser();

    switch (type) {
      case "target":
        return await fetchTargetLikes(user.id);

      case "source":
        return await fetchSourceLikes(user.id);

      case "mutual":
        return await fetchMutualLikes(user.id);
      default:
        return [];
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function fetchTargetLikes(id: string) {
  // return users that current user has liked
  const targets = await prisma.like.findMany({
    where: { sourceUserId: id },
    select: { targetMember: true },
  });

  return targets.map((x) => x.targetMember);
}
async function fetchSourceLikes(id: string) {
  // return users that like the current user
  const sources = await prisma.like.findMany({
    where: { targetUserId: id },
    select: { sourceMember: true },
  });

  return sources.map((x) => x.sourceMember);
}

async function fetchMutualLikes(id: string) {
  // return mutual likes
  const likedUsers = await prisma.like.findMany({
    where: { sourceUserId: id },
    select: { targetUserId: true },
  });

  const likedIds = likedUsers.map((x) => x.targetUserId);

  const mutualList = await prisma.like.findMany({
    where: {
      AND: [{ targetUserId: id }, { sourceUserId: { in: likedIds } }],
    },
    select: { sourceMember: true },
  });

  return mutualList.map((x) => x.sourceMember);
}
