// components/navbar/NotificationBell.tsx
"use client";
import React, { RefObject, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationService, NotificationResponse } from "@/features/admin/services/NotificationService";

interface Props {
  isOpen: boolean;
  toggle: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  refObj: RefObject<HTMLDivElement | null>;
}

export const NotificationBell = ({
  isOpen,
  toggle,
  onMouseLeave,
  refObj,
}: Props) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await NotificationService.getNotifications(0, 5); // 최근 5개만 가져오기
      setNotifications(response.notifications);
    } catch (error) {
      console.error("알림 조회 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      await fetchNotifications(); // 목록 새로고침
    } catch (error) {
      console.error("알림 읽음 처리 오류:", error);
    }
  };

  // 전체 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await fetchNotifications(); // 목록 새로고침
    } catch (error) {
      console.error("전체 알림 읽음 처리 오류:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={refObj}>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:text-sky-500 transition-colors duration-300"
        onClick={toggle}
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-sky-500 rounded-full" />
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50"
          onMouseLeave={onMouseLeave}
        >
          <div className="p-4 border-b border-gray-800/50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">알림</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-400 hover:text-white"
                onClick={handleMarkAllAsRead}
              >
                전체 읽음
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition text-xs text-gray-400 hover:text-white"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        읽음
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                새로운 알림이 없습니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
