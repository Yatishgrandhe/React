import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { User, Loader2 } from "lucide-react"

interface UserAvatarProps {
  user: {
    full_name?: string | null
    avatar_url?: string | null
    email?: string | null
  } | null
  loading?: boolean
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ user, loading = false, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  }

  return (
    <Avatar className={`${sizeClasses[size]} border border-muted`}>
      {loading ? (
        <AvatarFallback>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        </AvatarFallback>
      ) : (
        <>
          <AvatarImage
            src={user?.avatar_url || ""}
            alt={user?.full_name || "User"}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = ""
            }}
          />
          <AvatarFallback>
            {user?.full_name ? getInitials(user.full_name) : <User className={iconSizes[size]} />}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  )
}
