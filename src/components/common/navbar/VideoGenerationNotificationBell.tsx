import React, { useEffect, useRef, useState } from "react";
import { Bell, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationNotificationService, GenerationNotificationResponse } from "@/features/admin/services/GenerationNotificationService";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import CreationDetail from "@/features/video/creation/CreationDetail";

export const VideoGenerationNotificationBell = () => {
    const [notifications, setNotifications] = useState<GenerationNotificationResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const refObj = useRef<HTMLDivElement | null>(null);
    // 마지막 폴링 타이밍을 추적하기 위한 참조
    const lastUpdateRef = useRef<number>(0);
    // 현재 처리 중인 알림이 있는지 추적
    const [hasProcessingItems, setHasProcessingItems] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    // 자동 갱신 간격 (밀리초)
    const POLLING_INTERVAL = 5000; // 5초

    const fetchNotifications = async () => {
        // 너무 빈번한 요청 방지 (최소 1초 간격)
        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) {
            return;
        }

        lastUpdateRef.current = now;

        try {
            setIsLoading(true);
            const response = await GenerationNotificationService.getNotifications(0, 5);

            // 새 알림이 있는지 확인
            if (notifications.length > 0) {
                const hasNew = response.notifications.some(newNotif =>
                    !notifications.some(oldNotif => oldNotif.id === newNotif.id)
                );

                if (hasNew) {
                    setHasNewNotification(true);
                    // 새 알림이 있고 메뉴가 닫혀있으면 알림 표시
                    if (!isOpen) {
                        toast("새 알림이 도착했습니다!", {
                            icon: "🔔"
                        });
                    }
                }
            }

            setNotifications(response.notifications);

            // 처리 중인 항목이 있는지 확인
            const hasProcessing = response.notifications.some(n => n.status === 'PROCESSING');
            setHasProcessingItems(hasProcessing);

            // 처리 중인 항목이 있으면 짧은 간격으로 폴링
            if (hasProcessing && isOpen) {
                setTimeout(fetchNotifications, POLLING_INTERVAL);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("비디오 생성 알림 조회 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 알림 메뉴가 열릴 때 데이터 가져오기
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            setHasNewNotification(false); // 메뉴가 열리면 새 알림 표시 해제
        }
    }, [isOpen]);

    // 처리 중인 항목이 있으면 주기적으로 갱신
    useEffect(() => {
        let pollingTimer: NodeJS.Timeout | null = null;

        if (isOpen && hasProcessingItems) {
            pollingTimer = setTimeout(fetchNotifications, POLLING_INTERVAL);
        }

        return () => {
            if (pollingTimer) clearTimeout(pollingTimer);
        };
    }, [hasProcessingItems, isOpen]);

    // 'open-notification-bell' 이벤트 처리
    useEffect(() => {
        const handler = () => {
            if (!isOpen) setIsOpen(true);
            fetchNotifications(); // 알림 등록 시 즉시 목록 갱신

            // 알림 벨 토스트 표시
            toast("비디오 생성 요청이 접수되었습니다", {
                icon: "🎬",
                duration: 3000
            });

            // 이벤트 발생 1초 후 한 번 더 확인 (백엔드 처리 시간 고려)
            setTimeout(() => {
                fetchNotifications();
            }, 1000);
        };

        window.addEventListener('open-notification-bell', handler);
        return () => window.removeEventListener('open-notification-bell', handler);
    }, [isOpen]);

    // 바깥 클릭 또는 ESC로 닫기
    useEffect(() => {
        if (!isOpen) return;

        const handleClick = (e: MouseEvent) => {
            if (refObj.current && !refObj.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // 메뉴가 열려있고 처리 중인 항목이 있을 때 수동 새로고침 버튼 제공
    const handleRefresh = () => {
        fetchNotifications();
    };

    const handleNotificationClick = (notification: GenerationNotificationResponse) => {
        if (notification.status === 'COMPLETED' && notification.videoId) {
            // 영상 ID가 있는 경우에만 상세 보기 모달 열기
            setSelectedNotificationId(notification.videoId);
            setIsOpen(false);
        } else if (notification.status === 'COMPLETED' && !notification.videoId) {
            // 영상 ID가 없는 경우 알림 표시
            toast("영상 정보를 찾을 수 없습니다.");
        } else if (notification.status === 'PROCESSING') {
            toast("영상이 아직 처리 중입니다.");
        } else if (notification.status === 'FAILED') {
            toast.error(`영상 생성 실패: ${notification.errorMessage || '알 수 없는 오류'}`);
        }
    };

    return (
        <div className="relative" ref={refObj}>
            <Button
                variant="ghost"
                size="icon"
                className={`relative hover:text-sky-500 transition-colors duration-300 ${hasNewNotification ? 'animate-pulse' : ''}`}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setHasNewNotification(false); // 클릭하면 알림 표시 제거
                }}
            >
                <Bell className={`w-5 h-5 ${hasNewNotification ? 'text-sky-500' : 'text-gray-300'}`} />
                {(hasProcessingItems || hasNewNotification) && (
                    <span className={`absolute top-0 right-0 w-2 h-2 ${hasNewNotification ? 'bg-red-500' : 'bg-sky-500'} rounded-full`} />
                )}
            </Button>
            {isOpen && (
                <div className="fixed right-0 top-16 w-80 bg-black/70 border border-gray-800/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800/50">
                        <span className="text-sm font-medium text-white">알림</span>
                        {(hasProcessingItems || notifications.length > 0) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefresh}
                                className="h-8 px-2 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                            >
                                <Loader2 className="w-3 h-3 mr-1" /> 새로고침
                            </Button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-4">
                                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-800/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-4 flex items-center gap-2 hover:bg-black/60 cursor-pointer transition-colors"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {notification.status === "PROCESSING" && (
                                            <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                                        )}
                                        {notification.status === "COMPLETED" && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                        {notification.status === "FAILED" && (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-200 mb-1 text-left">{notification.title.length > 20 ? notification.title.slice(0, 20) + '...' : notification.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 text-left">{new Date(notification.updatedAt).toLocaleString()}</p>
                                            {notification.status === "FAILED" && notification.errorMessage && (
                                                <p className="text-xs text-red-400 mt-1 text-left">{notification.errorMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">새로운 비디오 생성 알림이 없습니다</div>
                        )}
                    </div>
                </div>
            )}

            {selectedNotificationId !== null && (
                <Dialog open={selectedNotificationId !== null} onOpenChange={(isOpenDialog) => {
                    if (!isOpenDialog) {
                        setSelectedNotificationId(null);
                    }
                }}>
                    <DialogContent className="max-w-4xl w-full h-[90vh] md:h-[85vh] p-0 bg-transparent border-none overflow-hidden flex items-center justify-center">
                        <CreationDetail
                            videoId={selectedNotificationId}
                            onBack={() => setSelectedNotificationId(null)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}; 