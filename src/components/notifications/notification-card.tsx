import type React from "react";

import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: {
    id: string;
    type: "invite" | "alert" | "achievement" | "settlement" | "insight";
    title: string;
    description: string;
    avatar?: string;
    actionText?: string;
    unread: boolean;
    timestamp: Date;
    icon: React.ReactNode;
    color: string;
  };
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationCard({
  notification,
}: NotificationCardProps) {
  return (
    <div
      className={
        "flex items-start gap-4 p-4 rounded-sm border-2 border-black transition-all duration-200"
      }
    >
      <div
        className={cn(
          "w-10 h-10 rounded-sm border-2 border-black flex items-center justify-center text-lg shrink-0 font-bold"
        )}
      >
        {notification.avatar || notification.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 leading-none">
            <h3 className="font-semibold text-foreground mb-1">
              {notification.title}
            </h3>
            <p className="text-sm text-black">{notification.description}</p>
            <p className="text-xs text-black mt-2">
              {formatTime(notification.timestamp)}
            </p>
          </div>
          {notification.unread && (
            <div className="w-2 h-2 bg-accent rounded-full mt-1.5 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
