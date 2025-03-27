"use client";

import React, { useState } from "react";
import {
  Bell,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NotificationSend = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("all");
  const [specificUserId, setSpecificUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [statusMessage, setStatusMessage] = useState("");

  // 알림 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setStatus("error");
      setStatusMessage("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (target === "specific" && !specificUserId.trim()) {
      setStatus("error");
      setStatusMessage("특정 유저 ID를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // API 요청 부분 (실제 구현 필요)
      // const response = await fetch("/api/admin/notifications/send", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     title,
      //     content,
      //     target,
      //     specificUserId: target === "specific" ? specificUserId : null
      //   }),
      // });

      // 실제 API 호출 대신 타이머로 대체 (데모용)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setStatusMessage("알림이 성공적으로 전송되었습니다.");

      // 성공 시 폼 초기화
      setTitle("");
      setContent("");
      setTarget("all");
      setSpecificUserId("");
    } catch (error) {
      console.error("알림 전송 오류:", error);
      setStatus("error");
      setStatusMessage("알림 전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 px-4 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-5 px-5 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium backdrop-blur-sm border border-gray-200/50">
            관리자 도구
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            회원 <span className="text-sky-500">알림 전송</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            중요한 공지사항이나 업데이트를 모든 회원 또는 특정 그룹에게
            전송하세요.
          </p>
        </div>

        <div>
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-100/80 p-1 rounded-lg">
              <TabsTrigger
                value="compose"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-sky-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                알림 작성
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-sky-600"
              >
                <Info className="w-4 h-4 mr-2" />
                전송 내역
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                    <Bell className="w-5 h-5 text-sky-500" />
                    알림 작성
                  </CardTitle>
                  <CardDescription>
                    회원들에게 전송할 알림 내용을 작성하세요.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    {/* 알림 상태 표시 */}
                    {status && (
                      <div
                        className={`p-4 rounded-lg ${
                          status === "success"
                            ? "bg-green-50 text-green-800 border border-green-100"
                            : "bg-red-50 text-red-800 border border-red-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {status === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                          <p>{statusMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* 알림 제목 */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-700">
                        알림 제목
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="알림 제목을 입력하세요"
                        className="h-11 border-gray-300 focus:ring-sky-300 focus:border-sky-300"
                        required
                      />
                    </div>

                    {/* 알림 내용 */}
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-gray-700">
                        알림 내용
                      </Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="알림 내용을 입력하세요"
                        className="min-h-[120px] border-gray-300 focus:ring-sky-300 focus:border-sky-300"
                        required
                      />
                    </div>

                    {/* 알림 대상 */}
                    <div className="space-y-2">
                      <Label htmlFor="target" className="text-gray-700">
                        알림 대상
                      </Label>
                      <Select value={target} onValueChange={setTarget}>
                        <SelectTrigger
                          id="target"
                          className="h-11 border-gray-300 focus:ring-sky-300 focus:border-sky-300"
                        >
                          <SelectValue placeholder="알림 대상을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 회원</SelectItem>
                          <SelectItem value="BEGINNER">
                            BEGINNER 회원
                          </SelectItem>
                          <SelectItem value="BASIC">BASIC 회원</SelectItem>
                          <SelectItem value="PREMIUM">PREMIUM 회원</SelectItem>
                          <SelectItem value="specific">특정 유저</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 특정 유저 ID 입력 필드 (특정 유저 선택 시에만 표시) */}
                    {target === "specific" && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="specificUserId"
                          className="text-gray-700"
                        >
                          유저 ID
                        </Label>
                        <Input
                          id="specificUserId"
                          value={specificUserId}
                          onChange={(e) => setSpecificUserId(e.target.value)}
                          placeholder="알림을 받을 유저 ID를 입력하세요"
                          className="h-11 border-gray-300 focus:ring-sky-300 focus:border-sky-300"
                          required
                        />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      disabled={isLoading}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          전송 중...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          알림 전송
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border border-gray-200 shadow-sm bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                    <Info className="w-5 h-5 text-sky-500" />
                    전송 내역
                  </CardTitle>
                  <CardDescription>
                    최근에 전송된 알림 목록입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="p-4 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item === 1
                                  ? "bg-red-500"
                                  : item === 2
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item === 1
                                  ? "긴급 공지: 서비스 점검 안내"
                                  : item === 2
                                  ? "신규 기능 업데이트 안내"
                                  : "프로모션: 프리미엄 회원 특별 할인"}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {item === 1
                                  ? "금일 오후 2시부터 4시까지 서비스 점검이 예정되어 있습니다."
                                  : item === 2
                                  ? "새로운 AI 영상 필터 기능이 추가되었습니다. 지금 확인해보세요!"
                                  : "모든 프리미엄 기능을 30% 할인된 가격으로 이용하세요."}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block">
                              {item === 1
                                ? "10분 전"
                                : item === 2
                                ? "3시간 전"
                                : "1일 전"}
                            </span>
                            <span className="text-xs text-gray-500 block mt-1">
                              {item === 1
                                ? "전체 회원"
                                : item === 2
                                ? "신규 회원"
                                : "프리미엄 회원"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            {
              title: "전체 회원",
              count: "1,243",
              icon: <Users className="w-5 h-5 text-sky-500" />,
            },
            {
              title: "오늘 전송된 알림",
              count: "5",
              icon: <Bell className="w-5 h-5 text-sky-500" />,
            },
            {
              title: "평균 확인율",
              count: "78%",
              icon: <CheckCircle className="w-5 h-5 text-sky-500" />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.count}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSend;
