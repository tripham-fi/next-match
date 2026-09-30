import { requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      await prisma.like.create({
        data: { sourceUserId: user.id, targetUserId },
      });
    }
  } catch (err) {
    console.log(err);
  }
}


export async function fetchCurrentUserLikeIds() {
    try {
        const user = await requireAuthUser();
        
        const likes = await prisma.like.findMany({
            where: {
                sourceUserId: user.id
            },
            select: {
                targetUserId: true
            }
        })

        return likes.map(like => like.targetUserId);
    } catch (err) {
        console.log(err);
        
    }
}