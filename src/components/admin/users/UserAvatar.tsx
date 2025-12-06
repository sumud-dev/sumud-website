import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const UserAvatar = ({ name, avatar, size = "md" }: UserAvatarProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={SIZE_CLASSES[size]}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
