import { usePresenceStore } from "@/lib/hooks/usePresenceStore";
import { transformImageUrl } from "@/lib/util";
import { Avatar, Badge } from "@heroui/react";

type Props = {
  userId: string;
  src?: string | null;
  name?: string | null;
};
export default function PresenceAvatar({ userId, src, name }: Props) {
  const members = usePresenceStore((state) => state.members);
  const isActive = members.indexOf(userId) !== -1;
  return (
    <Badge.Anchor>
      <Avatar>
        <Avatar.Image
          alt={name || ""}
          src={transformImageUrl(src) || "/images/user.png"}
        />
        {name && <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>}
      </Avatar>
      {isActive && <Badge color="success" placement="top-right" size="sm" />}
    </Badge.Anchor>
  );
}
