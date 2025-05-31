import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Bell, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationNotificationService, GenerationNotificationResponse } from "@/features/admin/services/GenerationNotificationService";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import CreationDetail from "@/features/video/creation/CreationDetail";

// 점 애니메이션 컴포넌트 수정 - 텍스트를 prop으로 받도록
const DotsAnimation = ({ text }: { text: string }) => {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => prev >= 3 ? 1 : prev + 1);
        }, 500); // 0.5초마다 점 개수 변경

        return () => clearInterval(interval);
    }, []);

    return <span>{text + ".".repeat(dotCount)}</span>;
};

export const VideoGenerationNotificationBell = () => {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<GenerationNotificationResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const refObj = useRef<HTMLDivElement | null>(null);
    // 마지막 폴링 타이밍을 추적하기 위한 참조
    const lastUpdateRef = useRef<number>(0);
    // 첫 로딩 여부를 추적
    const isFirstLoadRef = useRef<boolean>(true);
    // 현재 처리 중인 알림이 있는지 추적
    const [hasProcessingItems, setHasProcessingItems] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
    // 자동 갱신 간격 (밀리초)
    const POLLING_INTERVAL = 5000; // 5초

    const fetchNotifications = useCallback(async () => {
        // 너무 빈번한 요청 방지 (최소 2초 간격)
        const now = Date.now();
        if (now - lastUpdateRef.current < 2000) {
            return;
        }

        lastUpdateRef.current = now;

        try {
            // 첫 로딩일 때만 로딩 표시 (깜빡임 방지)
            if (isFirstLoadRef.current) {
                setIsLoading(true);
                isFirstLoadRef.current = false;
            }
            const response = await GenerationNotificationService.getNotifications(0, 5);

            // 새 알림이 있는지 확인 - setNotifications 콜백에서 처리
            setNotifications(prevNotifications => {
                const hasNew = prevNotifications.length > 0 && response.notifications.some(newNotif =>
                    !prevNotifications.some(oldNotif => oldNotif.id === newNotif.id)
                );

                if (hasNew) {
                    setHasNewNotification(true);
                    // 새 알림이 있고 메뉴가 닫혀있으면 알림 표시
                    if (!isOpen) {
                        toast({ title: "새 알림이 도착했습니다!", description: undefined, duration: 3000 });
                    }
                }

                const updatedNotifications = response.notifications.map(newNotif => {
                    const prevNotif = prevNotifications.find(p => p.id === newNotif.id);

                    // 새로운 알림이나 상태가 변경된 알림에 대해 로그 출력
                    if (!prevNotif) {
                        console.log(`[알림 업데이트] 새 알림 생성:`, {
                            id: newNotif.id,
                            title: newNotif.title,
                            status: newNotif.status,
                            videoId: newNotif.videoId,
                            hasVideoId: !!newNotif.videoId
                        });
                    } else if (JSON.stringify(prevNotif) !== JSON.stringify(newNotif)) {
                        console.log(`[알림 업데이트] 알림 상태 변경:`, {
                            id: newNotif.id,
                            title: newNotif.title,
                            previousStatus: prevNotif.status,
                            newStatus: newNotif.status,
                            previousVideoId: prevNotif.videoId,
                            newVideoId: newNotif.videoId,
                            hasVideoId: !!newNotif.videoId
                        });

                        // 상태가 COMPLETED로 변경되고 videoId가 있는 경우 특별한 처리
                        if (prevNotif.status !== 'COMPLETED' && newNotif.status === 'COMPLETED') {
                            if (newNotif.videoId) {
                                console.log(`[알림] 비디오 생성 완료 - videoId: ${newNotif.videoId}`);
                                // 메뉴가 닫혀있을 때만 완료 알림 표시
                                if (!isOpen) {
                                    toast({ title: "영상 생성 완료", description: `"${newNotif.title}" 영상이 생성되었습니다! 알림을 클릭하여 확인하세요.`, duration: 5000 });
                                }
                            } else {
                                console.warn(`[알림] 비디오 생성 완료되었지만 videoId 없음:`, newNotif);
                                if (!isOpen) {
                                    toast({ title: "영상 생성 완료", description: `"${newNotif.title}" 영상이 생성되었습니다! 내 작업물에서 확인하세요.`, duration: 4000 });
                                }
                            }
                        } else if (prevNotif.status !== 'FAILED' && newNotif.status === 'FAILED') {
                            // 실패 상태로 변경된 경우
                            console.error(`[알림] 비디오 생성 실패:`, {
                                id: newNotif.id,
                                title: newNotif.title,
                                error: newNotif.errorMessage
                            });
                            if (!isOpen) {
                                toast({ title: "영상 생성 실패", description: `"${newNotif.title}" 영상 생성이 실패했습니다.`, duration: 5000, variant: "destructive" });
                            }
                        }
                    }

                    // 이전 상태와 동일하면 이전 객체 재사용
                    return prevNotif && JSON.stringify(prevNotif) === JSON.stringify(newNotif)
                        ? prevNotif
                        : newNotif;
                });

                // 실제로 변경된 경우에만 상태 업데이트
                if (JSON.stringify(prevNotifications) === JSON.stringify(updatedNotifications)) {
                    return prevNotifications; // 동일하면 이전 상태 유지
                }

                return updatedNotifications;
            });

            // 처리 중인 항목이 있는지 확인
            const hasProcessing = response.notifications.some(n => n.status === 'PROCESSING');
            setHasProcessingItems(hasProcessing);

        } catch (error) {
            console.error("비디오 생성 알림 조회 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isOpen]);

    // 알림 메뉴가 열릴 때 데이터 가져오기
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            setHasNewNotification(false); // 메뉴가 열리면 새 알림 표시 해제
        }
    }, [isOpen, fetchNotifications]);

    // 처리 중인 항목이 있으면 주기적으로 갱신
    useEffect(() => {
        let pollingTimer: NodeJS.Timeout | null = null;

        if (isOpen && hasProcessingItems) {
            pollingTimer = setTimeout(() => {
                fetchNotifications();
            }, POLLING_INTERVAL);
        }

        return () => {
            if (pollingTimer) clearTimeout(pollingTimer);
        };
    }, [hasProcessingItems, isOpen, fetchNotifications]);

    // 'open-notification-bell' 이벤트 처리
    useEffect(() => {
        const handler = () => {
            if (!isOpen) setIsOpen(true);
            fetchNotifications(); // 알림 등록 시 즉시 목록 갱신

            // 알림 벨 토스트 표시 - 일반화된 메시지
            toast({ title: "작업 요청이 접수되었습니다", description: undefined, duration: 3000 });

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
    const handleRefresh = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationClick = useCallback((notification: GenerationNotificationResponse) => {
        console.log('[알림 클릭] 상세 알림 정보:', {
            id: notification.id,
            status: notification.status,
            videoId: notification.videoId,
            title: notification.title,
            hasVideoId: !!notification.videoId,
            videoIdType: typeof notification.videoId,
            fullNotification: notification
        });

        if (notification.status === 'COMPLETED') {
            if (notification.videoId) {
                // 영상 ID가 있는 경우에만 상세 보기 모달 열기
                console.log('[알림 클릭] 비디오 상세 보기 열기, videoId:', notification.videoId);
                setSelectedNotificationId(notification.videoId);
                setIsOpen(false);
                toast({ title: "상세 보기", description: "영상 상세 보기를 열고 있습니다.", duration: 3000 });
            } else {
                // 영상 ID가 없는 경우 - 가상 피팅이나 기타 작업 완료
                console.log('[알림 클릭] 완료된 작업 - 내 작업물 페이지로 이동:', {
                    notificationId: notification.id,
                    status: notification.status,
                    title: notification.title
                });

                // 가상 피팅인지 확인
                if (notification.title.includes("가상 피팅")) {
                    toast({ title: "가상 피팅 완료", description: "가상 피팅이 완료되었습니다! 내 작업물에서 확인하세요.", duration: 4000 });
                } else {
                    toast({ title: "작업 완료", description: "작업이 완료되었습니다! 내 작업물에서 확인하세요.", duration: 4000 });
                }

                // 내 작업물 페이지로 이동
                window.location.href = '/my';
            }
        } else if (notification.status === 'PROCESSING') {
            // 가상 피팅인지 확인하여 적절한 메시지 표시
            if (notification.title.includes("가상 피팅")) {
                toast({ title: "가상 피팅 처리 중", description: "가상 피팅이 처리 중입니다. 잠시 후 다시 확인해주세요.", duration: 3000 });
            } else {
                toast({ title: "작업 처리 중", description: "작업이 아직 처리 중입니다. 잠시 후 다시 확인해주세요.", duration: 3000 });
            }
        } else if (notification.status === 'FAILED') {
            const errorMsg = notification.errorMessage || '알 수 없는 오류가 발생했습니다.';

            // 가상 피팅인지 확인하여 적절한 메시지 표시
            if (notification.title.includes("가상 피팅")) {
                toast({ title: "가상 피팅 실패", description: errorMsg, duration: 5000, variant: "destructive" });
            } else {
                toast({ title: "작업 실패", description: errorMsg, duration: 5000, variant: "destructive" });
            }
        } else if (notification.status === 'REQUESTED') {
            // 가상 피팅인지 확인하여 적절한 메시지 표시
            if (notification.title.includes("가상 피팅")) {
                toast({ title: "가상 피팅 대기 중", description: "가상 피팅 요청이 대기 중입니다.", duration: 3000 });
            } else {
                toast({ title: "작업 대기 중", description: "작업 요청이 대기 중입니다.", duration: 3000 });
            }
        } else {
            console.warn('[알림 클릭] 알 수 없는 상태:', {
                status: notification.status,
                notification: notification
            });
            toast({ title: "알 수 없는 상태", description: "알 수 없는 상태의 알림입니다.", duration: 3000 });
        }
    }, []);

    return (
        <div className="relative" ref={refObj}>
            <Button
                variant="ghost"
                size="icon"
                className={`relative hover:text-gray-100 transition-colors duration-300 ${hasNewNotification ? 'animate-pulse' : ''}`}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setHasNewNotification(false); // 클릭하면 알림 표시 제거
                }}
            >
                <Bell className={`w-5 h-5 ${hasNewNotification ? 'text-white' : 'text-gray-300'}`} />
                {(hasProcessingItems || hasNewNotification) && (
                    <span className={`absolute top-0 right-0 w-2 h-2 ${hasNewNotification ? 'bg-white' : 'bg-gray-400'} rounded-full`} />
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
                                className="h-8 px-2 text-xs text-gray-200 hover:text-white hover:bg-gray-700/30"
                            >
                                <Loader2 className="w-3 h-3 mr-1 text-gray-400" /> 새로고침
                            </Button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-4">
                                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-800/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 flex items-center gap-2 transition-colors ${notification.status === 'COMPLETED' && notification.videoId
                                            ? 'hover:bg-black/60 cursor-pointer'
                                            : notification.status === 'COMPLETED' && !notification.videoId
                                                ? 'hover:bg-black/60 cursor-pointer'
                                                : notification.status === 'PROCESSING'
                                                    ? 'hover:bg-black/60 cursor-pointer'
                                                    : notification.status === 'FAILED'
                                                        ? 'hover:bg-gray-800/30 cursor-pointer'
                                                        : 'cursor-default'
                                            }`}
                                        onClick={() => {
                                            if (
                                                notification.status === "COMPLETED" &&
                                                !notification.videoId &&
                                                notification.title.includes("가상 피팅")
                                            ) {
                                                toast({ title: "가상 피팅 결과", description: "가상 피팅 결과는 아래 'fashn' 폴더에서 확인해주세요.", duration: 4000 });
                                            } else {
                                                handleNotificationClick(notification);
                                            }
                                        }}
                                    >
                                        {notification.status === "PROCESSING" && (
                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                        )}
                                        {notification.status === "COMPLETED" && (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        )}
                                        {notification.status === "FAILED" && (
                                            <XCircle className="w-4 h-4 text-gray-500" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-200 mb-1 text-left">{notification.title.length > 20 ? notification.title.slice(0, 20) + '...' : notification.title}</p>

                                            {notification.status === "COMPLETED" && notification.videoId && (
                                                <p className="text-xs text-gray-400 mt-1 text-left flex items-center gap-1">
                                                    <span>클릭하여 영상 보기</span>
                                                </p>
                                            )}
                                            {notification.status === "COMPLETED" && !notification.videoId && (
                                                <p className="text-xs text-gray-400 mt-1 text-left flex items-center gap-1">
                                                    <span>
                                                        {notification.title.includes("가상 피팅")
                                                            ? "클릭하여 결과 확인"
                                                            : "내 작업물에서 확인 가능"
                                                        }
                                                    </span>
                                                </p>
                                            )}
                                            {notification.status === "PROCESSING" && (
                                                <p className="text-xs text-gray-400 mt-1 text-left flex items-center gap-1">
                                                    <DotsAnimation text="처리 중" />
                                                </p>
                                            )}
                                            {notification.status === "REQUESTED" && (
                                                <p className="text-xs text-gray-500 mt-1 text-left flex items-center gap-1">
                                                    <DotsAnimation text="대기 중" />
                                                </p>
                                            )}
                                            {notification.status === "FAILED" && notification.errorMessage && (
                                                <p className="text-xs text-gray-500 mt-1 text-left">❌ {notification.errorMessage}</p>
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
                        console.log('[Dialog] 비디오 상세 모달 닫기');
                        setSelectedNotificationId(null);
                    }
                }}>
                    <DialogContent className="max-w-4xl w-full h-[90vh] md:h-[85vh] p-0 bg-transparent border-none overflow-hidden flex items-center justify-center">
                        <CreationDetail
                            videoId={selectedNotificationId}
                            onBack={() => {
                                console.log('[Dialog] CreationDetail에서 뒤로가기 클릭');
                                setSelectedNotificationId(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}; 