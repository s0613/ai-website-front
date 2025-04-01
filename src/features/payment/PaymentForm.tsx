"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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

// 애니메이션 효과
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 },
};

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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
      <div className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 min-h-screen py-12 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-sky-300 blur-[100px]" />
          <div className="absolute top-[10%] -left-[5%] w-[25%] h-[25%] rounded-full bg-blue-300 blur-[120px]" />
        </div>

        <div className="container max-w-2xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <div className="h-24 w-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-14 w-14 text-white" />
              </div>
            </motion.div>

            <Card className="border-green-100 bg-gradient-to-br from-white to-green-50 shadow-lg overflow-hidden">
              <CardContent className="pt-8 pb-10 text-center">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl font-bold mb-3 text-gray-900"
                >
                  결제가 완료되었습니다!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  <span className="font-medium text-green-600">
                    {planTitle} 플랜
                  </span>{" "}
                  구매가 성공적으로 완료되었습니다.
                  <br />
                  <span className="font-medium">{planCredits} 크레딧</span>이
                  계정에 추가되었습니다.
                </motion.p>

                <Separator className="my-6" />

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex gap-4 justify-center mt-6"
                >
                  <Link href="/dashboard">
                    <Button className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow-sm hover:shadow transition-all duration-300 px-6">
                      대시보드로 이동
                    </Button>
                  </Link>
                  <Link href="/generation/video">
                    <Button
                      variant="outline"
                      className="hover:bg-sky-50 border-sky-200 text-sky-600 shadow-sm hover:shadow transition-all duration-300"
                    >
                      영상 생성하기
                    </Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 min-h-screen py-12 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-sky-300 blur-[100px]" />
        <div className="absolute top-[10%] -left-[5%] w-[25%] h-[25%] rounded-full bg-blue-300 blur-[120px]" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <motion.div {...fadeIn} className="mb-8">
          <Link
            href="/payment"
            className="flex items-center text-sm text-sky-600 hover:text-sky-700 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            멤버십 플랜으로 돌아가기
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-6 text-gray-900"
        >
          <span className="text-sky-600">{planTitle} 플랜</span> 결제
        </motion.h1>

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 결제 정보 입력 폼 */}
          <motion.div variants={slideUp} className="md:col-span-2">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-white border-b border-gray-100">
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        이메일
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-gray-200 focus:border-sky-300 focus:ring-sky-300"
                      />
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <RadioGroup
                        defaultValue="card"
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="mb-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="card"
                            id="card"
                            className="text-sky-600"
                          />
                          <Label
                            htmlFor="card"
                            className="flex items-center gap-2 cursor-pointer text-gray-700"
                          >
                            <CreditCard className="h-4 w-4 text-sky-500" />
                            신용카드/체크카드
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-gray-700">
                        카드 소유자 이름
                      </Label>
                      <Input
                        type="text"
                        id="cardName"
                        placeholder="카드에 표시된 이름"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        className="border-gray-200 focus:border-sky-300 focus:ring-sky-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-gray-700">
                        카드 번호
                      </Label>
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
                        className="border-gray-200 focus:border-sky-300 focus:ring-sky-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry" className="text-gray-700">
                          만료일 (MM/YY)
                        </Label>
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
                          className="border-gray-200 focus:border-sky-300 focus:ring-sky-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc" className="text-gray-700">
                          CVC/CVV
                        </Label>
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
                          className="border-gray-200 focus:border-sky-300 focus:ring-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* 주문 요약 */}
          <motion.div variants={slideUp} className="md:col-span-1">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-sky-50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-white border-b border-gray-100">
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sky-700">
                      {planTitle} 플랜
                    </h3>
                    <p className="text-sm text-gray-600">
                      {billingType === "yearly" ? "연간 결제" : "월간 결제"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-700">크레딧</span>
                    <span className="font-medium text-sky-700">
                      {planCredits} 크레딧
                    </span>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      총 결제 금액
                    </span>
                    <span className="font-bold text-lg text-sky-700">
                      {planPrice}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-white to-sky-50 pt-4">
                <Button
                  className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 group-hover:translate-y-0.5 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow"
                  onClick={handleSubmit}
                  disabled={status === "processing"}
                >
                  {status === "processing" ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    `${planPrice} 결제하기`
                  )}
                </Button>
              </CardFooter>
            </Card>

            <motion.div
              variants={slideUp}
              className="mt-4 text-center text-sm text-gray-500"
            >
              <p>결제 진행 시 서비스 이용약관에 동의하게 됩니다.</p>
              <p className="mt-1">
                모든 결제 정보는 안전하게 암호화되어 처리됩니다.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
