// components/navbar/NotificationBell.tsx
"use client";
import React from "react";
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
  refObj: React.RefObject<HTMLDivElement>;
}

export const NotificationBell = ({
  notifications,
  isOpen,
  toggle,
  refObj,
}: Props) => (
  <div className="relative" ref={refObj}>
    <Button
      variant="ghost"
      size="icon"
      className="mr-2 rounded-full hover:bg-white hover:text-sky-500 transition"
      onClick={toggle}
    >
      <Bell className="h-4 w-4" />
      {notifications.length > 0 && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </Button>

    {isOpen && (
      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
        <div className="px-4 py-2 border-b bg-gray-50">
          <p className="text-sm font-medium text-gray-900">알림</p>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="px-4 py-2 border-b hover:bg-gray-50 transition"
              >
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-500">{n.date}</p>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              새로운 알림이 없습니다
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
