import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

export async function getMembers() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;
  try {
    return prisma.member.findMany({
      where: { NOT: { userId: currentUser.id } },
    });
  } catch (err) {
    console.log(err);
  }
}

export const getMemberByUserId = cache((id: string) => {
  try {
    return prisma.member.findUnique({ where: { userId: id } });
  } catch (err) {
    console.log(err);
  }
})
