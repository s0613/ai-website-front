// components/navbar/NotificationBell.tsx
"use client";
import React, { RefObject } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  message: string;
  date: string;
}

interface Props {
  notifications: Notification[];
  isOpen: boolean;
  toggle: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  refObj: RefObject<HTMLDivElement | null>;
}

export const NotificationBell = ({
  notifications,
  isOpen,
  toggle,
  onMouseLeave,
  refObj,
}: Props) => (
  <div className="relative" ref={refObj}>
    <Button
      variant="ghost"
      size="icon"
      className="mr-2 rounded-full hover:bg-gray-800/50 hover:text-sky-500 transition"
      onClick={toggle}
    >
      <div className="relative">
        <Bell className="h-5 w-5 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
    </Button>

    {isOpen && (
      <div
        className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1 z-50"
        onMouseLeave={onMouseLeave}
      >
        <div className="px-4 py-2 border-b border-gray-800/50 bg-gray-800/50">
          <p className="text-sm font-medium text-white">알림</p>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="px-4 py-2 border-b border-gray-800/50 hover:bg-gray-800/50 transition"
              >
                <p className="text-sm text-gray-300">{n.message}</p>
                <p className="text-xs text-gray-400">{n.date}</p>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              새로운 알림이 없습니다
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
