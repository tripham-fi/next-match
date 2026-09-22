"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type props = {
  href: string;
  label: string;
};

export default function NavLink({ href, label }: props) {
  const pathName = usePathname();
  return (
    <Link
      href={href}
      className={
        pathName === href ? "text-yellow-400" : "hover:text-yellow-400/80"
      }
    >
      {label}
    </Link>
  );
}
