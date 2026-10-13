"use client";

import { useMessageStore } from "@/lib/hooks/useMessageStore";
import { Badge } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
};

export default function NavLink({ href, label }: Props) {
  const pathName = usePathname();
  const unreadCount = useMessageStore((state) => state.unreadCount);
  const isMessages = href === "/messages";
  return (
    <Badge.Anchor className={isMessages ? "pr-5" : ""}>
      <Link
        href={href}
        className={
          pathName === href ? "text-yellow-400" : "hover:text-yellow-400/80"
        }
      >
        {label}
      </Link>
      {isMessages && unreadCount > 0 && (
        <Badge color="accent" size="md">
          {unreadCount}
        </Badge>
      )}
    </Badge.Anchor>
  );
}
