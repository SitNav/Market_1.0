import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

interface UserAvatarProps {
  user: User | null | undefined;
  className?: string;
  showOnlineStatus?: boolean;
}

export default function UserAvatar({ 
  user, 
  className = "h-8 w-8",
  showOnlineStatus = false
}: UserAvatarProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getAvatarColor = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "bg-gray-500";
    
    const colors = [
      "bg-red-500",
      "bg-blue-500", 
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500"
    ];
    
    const nameString = `${firstName || ""}${lastName || ""}`;
    const hash = nameString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (!user) {
    return (
      <Avatar className={cn(className)}>
        <AvatarFallback className="bg-gray-500 text-white">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="relative">
      <Avatar className={cn(className)}>
        {user.profileImageUrl ? (
          <AvatarImage 
            src={user.profileImageUrl} 
            alt={`${user.firstName} ${user.lastName}`}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback 
          className={cn(
            "text-white font-medium",
            getAvatarColor(user.firstName, user.lastName)
          )}
        >
          {getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
}
