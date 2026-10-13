import { LikeSourceDto } from "@/lib/types";
import { transformImageUrl } from "@/lib/util";
import { toast } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

export const likeToast = (like: LikeSourceDto) => {
  toast(
    <Link
      href={`/members/${like.userId}`}
      className="font-semibold hover:underline"
    >
      {like.name} has liked you!
    </Link>,
    {
      indicator: (
        <Image
          src={transformImageUrl(like.image) || "/images/user.png"}
          height={40}
          width={40}
          alt="sender image"
          className="rounded-full object-cover"
        />
      ),
      description: (
        <Link href={`/members/${like.userId}`} className="text-sm hover:underline">
          Click to view
        </Link>
      ),
      variant: "accent",
      timeout: 5000,
    },
  );
};
