"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../user/AuthContext";
import { settingService } from "./services/SettingService";
import { useToast } from "@/hooks/use-toast";
import { validateNickname } from "./utils/VaildateNickname"; // 닉네임 유효성 검사 유틸리티 import

const SettingPage = () => {
  const router = useRouter();
  const { nickname: userNickname, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null); // 유효성 검사 오류 메시지 상태

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  // 닉네임이 변경될 때마다 유효성 검사
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);

    // 닉네임이 비어있으면 유효성 오류 메시지를 표시하지 않음
    if (!newNickname.trim()) {
      setValidationError(null);
      return;
    }

    // 현재 닉네임과 같으면 유효성 검사 스킵
    if (newNickname === userNickname) {
      setValidationError(null);
      return;
    }

    // 닉네임 유효성 검사
    const validationResult = validateNickname(newNickname);
    if (!validationResult.isValid) {
      setValidationError(validationResult.message);
    } else {
      setValidationError(null);
    }
  };

  const handleSave = async () => {
    // 닉네임 유효성 재검사
    const validationResult = validateNickname(nickname);
    if (!validationResult.isValid) {
      setValidationError(validationResult.message);
      toast({
        title: "닉네임 유효성 오류",
        description: validationResult.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      if (nickname !== userNickname) {
        const response = await settingService.updateNickname(nickname);

        if (response.success) {
          login("", "", "", nickname);

          setSaveSuccess(true);
          toast({
            title: "닉네임 변경 성공",
            description: "닉네임이 성공적으로 변경되었습니다.",
          });
        } else {
          toast({
            title: "닉네임 변경 실패",
            description: response.message || "닉네임 변경에 실패했습니다.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("닉네임 변경 중 오류 발생:", error);
      toast({
        title: "오류 발생",
        description: "닉네임 변경 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (saveSuccess) {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2 p-2 rounded-full text-gray-600 hover:text-sky-600 hover:bg-sky-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">설정</h1>
            <p className="text-sm text-gray-500 mt-1">
              계정 및 개인 설정을 관리하세요
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-100/80 p-0.5 rounded-lg grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 text-gray-600 shadow-none data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>프로필</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 text-gray-600 shadow-none data-[state=active]:shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span>알림</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 text-gray-600 shadow-none data-[state=active]:shadow-sm"
            >
              <Palette className="h-4 w-4" />
              <span>화면 설정</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 text-gray-600 shadow-none data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              <span>개인정보</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="border border-gray-200/80 shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">
                  프로필 설정
                </CardTitle>
                <CardDescription className="text-gray-500">
                  프로필 정보를 수정하고 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-gray-700">
                    닉네임
                  </Label>
                  <Input
                    id="name"
                    placeholder="닉네임 입력"
                    value={nickname}
                    onChange={handleNicknameChange} // 닉네임 변경 핸들러 변경
                    className={`border-gray-200 focus:border-sky-300 focus:ring-sky-200/40 ${
                      validationError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
                        : ""
                    }`}
                  />
                  {validationError && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button
                  onClick={handleSave}
                  disabled={
                    isLoading ||
                    nickname === userNickname ||
                    !nickname.trim() ||
                    !!validationError // 유효성 검사 오류가 있으면 저장 버튼 비활성화
                  }
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      저장됨
                    </>
                  ) : (
                    "변경사항 저장"
                  )}
                </Button>
                {nickname !== userNickname && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNickname(userNickname);
                      setValidationError(null); // 취소 시 유효성 오류 메시지 초기화
                    }}
                    className="border-gray-200"
                  >
                    취소
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <Card className="border border-gray-200/80 shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">
                  알림 설정
                </CardTitle>
                <CardDescription className="text-gray-500">
                  알림 기본 설정을 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label
                      htmlFor="email-notifications"
                      className="text-gray-700"
                    >
                      이메일 알림
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      중요한 업데이트에 대한 이메일을 받습니다.
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label
                      htmlFor="push-notifications"
                      className="text-gray-700"
                    >
                      푸시 알림
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      앱 푸시 알림을 받습니다.
                    </p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label
                      htmlFor="marketing-notifications"
                      className="text-gray-700"
                    >
                      마케팅 알림
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      프로모션 및 마케팅 정보를 받습니다.
                    </p>
                  </div>
                  <Switch id="marketing-notifications" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "변경사항 저장"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card className="border border-gray-200/80 shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">
                  화면 설정
                </CardTitle>
                <CardDescription className="text-gray-500">
                  테마와 디스플레이 설정을 관리하세요.
                </CardDescription>
              </CardHeader>
              <div className="relative">
                <div className="filter blur-[3px] opacity-60 pointer-events-none">
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="theme" className="text-gray-700">
                        테마
                      </Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="w-full border-gray-200 focus:border-sky-300 focus:ring-sky-200/40">
                          <SelectValue placeholder="테마 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">라이트 모드</SelectItem>
                          <SelectItem value="dark">다크 모드</SelectItem>
                          <SelectItem value="system">
                            시스템 설정 사용
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-3">
                      <Label htmlFor="language" className="text-gray-700">
                        언어
                      </Label>
                      <Select defaultValue="ko">
                        <SelectTrigger className="w-full border-gray-200 focus:border-sky-300 focus:ring-sky-200/40">
                          <SelectValue placeholder="언어 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        "변경사항 저장"
                      )}
                    </Button>
                  </CardFooter>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 px-8 py-6 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      준비중입니다
                    </h3>
                    <p className="text-gray-600">
                      해당 기능은 곧 제공될 예정입니다.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card className="border border-gray-200/80 shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">
                  개인정보 설정
                </CardTitle>
                <CardDescription className="text-gray-500">
                  개인정보 보호 및 보안 설정을 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="data-sharing" className="text-gray-700">
                      데이터 공유
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      서비스 개선을 위해 익명 데이터를 공유합니다.
                    </p>
                  </div>
                  <Switch id="data-sharing" defaultChecked />
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 pt-2">
                  <Label htmlFor="data-export" className="text-gray-700">
                    데이터 내보내기
                  </Label>
                  <p className="text-sm text-gray-500">
                    모든 개인 데이터의 사본을 다운로드합니다.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 border-gray-200 hover:border-sky-200 hover:bg-sky-50 gap-2"
                  >
                    <Key className="h-4 w-4" />
                    데이터 내보내기
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "변경사항 저장"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingPage;
