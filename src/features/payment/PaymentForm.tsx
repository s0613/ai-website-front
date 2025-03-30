"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// 결제 상태 타입
type PaymentStatus = "idle" | "processing" | "success" | "error";

// 결제 폼 컴포넌트
export default function PaymentForm() {
  const searchParams = useSearchParams();
  const planTitle = searchParams.get("plan") || "";
  const planPrice = searchParams.get("price") || "";
  const planCredits = searchParams.get("credits") || "";
  const billingType = searchParams.get("billing") || "monthly";

  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 카드번호 포맷팅 (4자리마다 공백)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // 카드 만료일 포맷팅 (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  // 결제 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName || !email) {
      setErrorMessage("모든 필드를 입력해주세요.");
      setStatus("error");
      return;
    }

    setStatus("processing");

    try {
      // 여기에 실제 결제 처리 API 호출 코드를 추가
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 결제 처리 시뮬레이션

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 결제 완료 화면
  if (status === "success") {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">결제가 완료되었습니다!</h2>
            <p className="text-muted-foreground mb-6">
              {planTitle} 플랜 구매가 성공적으로 완료되었습니다. 크레딧이 계정에
              추가되었습니다.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Link href="/">
                <Button>홈으로 이동</Button>
              </Link>
              <Link href="/generation/video">
                <Button variant="outline">영상 생성하기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/payment"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          멤버십 플랜으로 돌아가기
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">결제 정보</h1>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 결제 정보 입력 폼 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>카드 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <RadioGroup
                      defaultValue="card"
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label
                          htmlFor="card"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4" />
                          신용카드/체크카드
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">카드 소유자 이름</Label>
                    <Input
                      type="text"
                      id="cardName"
                      placeholder="카드에 표시된 이름"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">카드 번호</Label>
                    <Input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">만료일 (MM/YY)</Label>
                      <Input
                        type="text"
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">CVC/CVV</Label>
                      <Input
                        type="text"
                        id="cardCvc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) =>
                          setCardCvc(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 주문 요약 */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>주문 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{planTitle} 플랜</h3>
                  <p className="text-sm text-muted-foreground">
                    {billingType === "yearly" ? "연간 결제" : "월간 결제"}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span>크레딧</span>
                  <span className="font-medium">{planCredits} 크레딧</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-1">
                  <span className="font-medium">총 결제 금액</span>
                  <span className="font-bold text-lg">{planPrice}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={status === "processing"}
              >
                {status === "processing"
                  ? "처리 중..."
                  : `${planPrice} 결제하기`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
