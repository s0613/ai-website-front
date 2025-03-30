"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 },
};

// 스태거 애니메이션 효과
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanProps {
  title: string;
  price: number | string;
  originalPrice?: number;
  credits: number;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
  isBusinessPlan?: boolean;
  billingType: "monthly" | "yearly";
}

const PlanCard: React.FC<PlanProps> = ({
  title,
  price,
  originalPrice,
  credits,
  description,
  features,
  recommended = false,
  isBusinessPlan = false,
  billingType,
}) => {
  const isStarterOrBusiness = title === "스타터" || title === "비즈니스";

  const getPriceString = () => {
    if (typeof price === "number") {
      return `₩${price.toLocaleString()}`;
    }
    return price;
  };

  return (
    <motion.div {...fadeIn} className="h-full">
      <Card
        className={`h-full flex flex-col relative cursor-pointer transition-all duration-500 hover:shadow-xl overflow-hidden group ${
          recommended
            ? "border-sky-400 bg-gradient-to-br from-white to-sky-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            recommended
              ? "bg-gradient-to-br from-sky-50 to-sky-100"
              : "bg-gray-50"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div
          className={`absolute bottom-0 left-0 w-full h-1 ${
            recommended ? "bg-sky-500" : "bg-gray-300"
          } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out`}
        />

        {recommended && (
          <Badge className="absolute right-4 -top-3 font-semibold z-10 bg-sky-500 text-white border-sky-500">
            추천
          </Badge>
        )}

        <CardHeader
          className={`relative z-10 pb-4 ${recommended ? "bg-sky-100/40" : ""}`}
        >
          <CardTitle
            className={`text-center text-xl ${
              recommended ? "text-sky-700" : "text-gray-900"
            } group-hover:${
              recommended ? "text-sky-800" : "text-gray-900"
            } transition-colors duration-300`}
          >
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col pt-2 pb-6 relative z-10">
          <div className="text-center mb-6">
            <span
              className={`text-3xl font-bold ${
                recommended ? "text-sky-700" : "text-gray-900"
              }`}
            >
              {typeof price === "number" ? `₩${price.toLocaleString()}` : price}
            </span>
            {originalPrice && (
              <span className="ml-2 text-sm line-through text-muted-foreground">
                ₩{originalPrice.toLocaleString()}
              </span>
            )}
            {billingType === "yearly" && typeof price === "number" && (
              <div className="text-xs text-muted-foreground mt-1">
                월 ₩{Math.floor(price / 12).toLocaleString()}
              </div>
            )}
            <div
              className={`font-medium mt-2 ${
                recommended ? "text-sky-500" : "text-primary"
              }`}
            >
              {credits} 크레딧{" "}
              {!isStarterOrBusiness &&
                (billingType === "yearly" ? "/ 연간" : "/ 월간")}
            </div>
          </div>

          <p className="text-center text-sm mb-6 text-gray-600">
            {description}
          </p>

          <Separator className="my-6" />

          <div className="mt-4 mb-8 space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                {feature.included ? (
                  <Check
                    className={`h-4 w-4 mr-3 flex-shrink-0 ${
                      recommended ? "text-sky-500" : "text-primary"
                    }`}
                  />
                ) : (
                  <div className="w-4 mr-3 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    feature.included ? "" : "text-muted-foreground"
                  }`}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            {isBusinessPlan ? (
              <Link href="/">
                <Button
                  variant="outline"
                  className={`w-full ${
                    recommended
                      ? "bg-sky-100 hover:bg-sky-200 text-sky-700 border-sky-300"
                      : "bg-primary/10 hover:bg-primary/20 text-primary"
                  } active:scale-[0.98] shadow-sm hover:shadow`}
                  size="lg"
                >
                  문의하기
                </Button>
              </Link>
            ) : (
              <Link
                href={
                  title === "스타터"
                    ? "/dashboard"
                    : `/payment/form?plan=${title}&price=${getPriceString()}&credits=${credits}&billing=${billingType}`
                }
              >
                <Button
                  variant={recommended ? "default" : "outline"}
                  className={`w-full ${
                    recommended
                      ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                      : "hover:bg-gray-100 active:bg-gray-200"
                  } group-hover:translate-y-0.5 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow`}
                  size="lg"
                >
                  {title === "스타터" ? "시작하기" : "구매하기"}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function MembershipPlan() {
  const [billingType, setBillingType] = useState<"monthly" | "yearly">(
    "yearly"
  );

  const monthlyPlans = [
    {
      title: "스타터",
      price: "무료",
      credits: 30,
      description:
        "AI 이미지 생성을 처음 시작하는 분들을 위한 무료 체험 패키지",
      features: [
        { text: "30 크레딧 제공", included: true },
        { text: "기본 이미지 편집 도구", included: true },
        { text: "표준 해상도", included: true },
        { text: "이메일 지원", included: true },
        { text: "AI 스타일 추천", included: false },
        { text: "크레딧 30일 유효기간", included: true },
      ],
      recommended: false,
      isBusinessPlan: false,
    },
    {
      title: "베이직",
      price: 15000,
      credits: 100,
      description: "개인 사용자를 위한 합리적인 크레딧 패키지",
      features: [
        { text: "100 크레딧 제공", included: true },
        { text: "중급 이미지 편집 도구", included: true },
        { text: "고해상도 지원", included: true },
        { text: "이메일 지원", included: true },
        { text: "AI 스타일 추천", included: false },
        { text: "크레딧 45일 유효기간", included: true },
      ],
      recommended: false,
      isBusinessPlan: false,
    },
    {
      title: "프리미엄",
      price: 29900,
      credits: 250,
      description: "전문가를 위한 고급 크레딧 패키지",
      features: [
        { text: "250 크레딧 제공", included: true },
        { text: "고급 이미지 편집 도구", included: true },
        { text: "최고 해상도 출력", included: true },
        { text: "우선 이메일 지원", included: true },
        { text: "AI 스타일 추천", included: true },
        { text: "크레딧 60일 유효기간", included: true },
      ],
      recommended: true,
      isBusinessPlan: false,
    },
    {
      title: "비즈니스",
      price: "문의",
      credits: 500,
      description:
        "기업과 팀을 위한 대용량 크레딧과 맞춤형 기능이 필요하신가요? 비즈니스 전용 혜택과 함께 기업에 최적화된 견적을 제공합니다.",
      features: [
        { text: "500+ 크레딧 제공", included: true },
        { text: "전체 편집 기능 액세스", included: true },
        { text: "최대 해상도 출력", included: true },
        { text: "24/7 전용 지원", included: true },
        { text: "팀 협업 기능", included: true },
        { text: "기업 전용 API 액세스", included: true },
      ],
      recommended: false,
      isBusinessPlan: true,
    },
  ];

  const yearlyPlans = [
    {
      title: "스타터",
      price: "무료",
      credits: 30,
      description:
        "AI 이미지 생성을 처음 시작하는 분들을 위한 무료 체험 패키지",
      features: [
        { text: "30 크레딧 제공", included: true },
        { text: "기본 이미지 편집 도구", included: true },
        { text: "표준 해상도", included: true },
        { text: "이메일 지원", included: true },
        { text: "AI 스타일 추천", included: false },
        { text: "크레딧 30일 유효기간", included: true },
      ],
      recommended: false,
      isBusinessPlan: false,
    },
    {
      title: "베이직",
      price: 144000,
      originalPrice: 180000, // 15000 * 12
      credits: 100,
      description:
        "개인 사용자를 위한 합리적인 크레딧 패키지, 연간 결제 시 20% 할인",
      features: [
        { text: "매월 100 크레딧 제공", included: true },
        { text: "중급 이미지 편집 도구", included: true },
        { text: "고해상도 지원", included: true },
        { text: "이메일 지원", included: true },
        { text: "AI 스타일 추천", included: false },
        { text: "크레딧 60일 유효기간", included: true },
      ],
      recommended: false,
      isBusinessPlan: false,
    },
    {
      title: "프리미엄",
      price: 287040,
      originalPrice: 358800, // 29900 * 12
      credits: 250,
      description: "전문가를 위한 고급 크레딧 패키지, 연간 결제 시 20% 할인",
      features: [
        { text: "매월 250 크레딧 제공", included: true },
        { text: "고급 이미지 편집 도구", included: true },
        { text: "최고 해상도 출력", included: true },
        { text: "우선 이메일 지원", included: true },
        { text: "AI 스타일 추천", included: true },
        { text: "크레딧 90일 유효기간", included: true },
      ],
      recommended: true,
      isBusinessPlan: false,
    },
    {
      title: "비즈니스",
      price: "문의",
      credits: 500,
      description:
        "기업과 팀을 위한 대용량 크레딧과 맞춤형 기능이 필요하신가요? 연간 계약 시 특별 할인과 전용 계정 관리자를 제공합니다.",
      features: [
        { text: "매월 500+ 크레딧 제공", included: true },
        { text: "전체 편집 기능 액세스", included: true },
        { text: "최대 해상도 출력", included: true },
        { text: "24/7 전용 지원", included: true },
        { text: "팀 협업 기능", included: true },
        { text: "기업 전용 API 액세스", included: true },
      ],
      recommended: false,
      isBusinessPlan: true,
    },
  ];

  const plans = billingType === "monthly" ? monthlyPlans : yearlyPlans;

  return (
    <div className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] rounded-full bg-sky-300 blur-[100px]" />
        <div className="absolute top-[10%] -left-[5%] w-[25%] h-[25%] rounded-full bg-blue-300 blur-[120px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div {...fadeIn} className="text-center mb-16 sm:mb-20">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-gray-900">
            필요한 만큼{" "}
            <motion.span {...fadeIn} className="text-sky-500">
              크레딧 패키지
            </motion.span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto px-4 mb-8">
            원하는 때 구매하고 자유롭게 사용하세요
          </p>

          <div className="flex justify-center mb-10">
            <Tabs
              defaultValue="yearly"
              value={billingType}
              onValueChange={(value) =>
                setBillingType(value as "monthly" | "yearly")
              }
              className="w-full max-w-[400px]"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="monthly">월간 결제</TabsTrigger>
                <TabsTrigger value="yearly" className="relative">
                  연간 결제
                  <Badge
                    variant="outline"
                    className="absolute -top-3 -right-2 font-normal text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    20% 할인
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* 균등한 크기의 4개 카드 그리드 */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={item}
              className="col-span-1"
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(0)",
                height: "100%",
              }}
            >
              <PlanCard {...plan} billingType={billingType} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...fadeIn} className="mt-16 sm:mt-20 md:mt-24 py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900">
            자주 묻는 <span className="text-sky-600">질문</span>
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            크레딧 사용과 결제에 관한 궁금증을 해결해드립니다
          </p>

          <div className="border rounded-lg overflow-hidden max-w-4xl mx-auto bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-6 py-4 font-medium hover:text-sky-600">
                  크레딧은 얼마나 오래 유효한가요?
                </AccordionTrigger>
                <AccordionContent className="px-6 py-3 text-gray-600">
                  크레딧 유효기간은 구매한 패키지에 따라 다릅니다. 스타터는
                  30일, 베이직은 45일, 프리미엄은 60일, 비즈니스 패키지는 맞춤형
                  유효기간을 제공합니다. 유효기간은 구매일로부터 계산됩니다.
                  연간 구독의 경우 크레딧 유효기간이 더 길게 적용됩니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6 py-4 font-medium hover:text-sky-600">
                  하나의 이미지 생성에 몇 크레딧이 사용되나요?
                </AccordionTrigger>
                <AccordionContent className="px-6 py-3 text-gray-600">
                  기본 이미지 생성은 1크레딧이 소모됩니다. 고해상도 이미지는
                  2크레딧, 초고해상도 이미지는 3크레딧이 소모됩니다. 특수 효과나
                  고급 편집 기능을 사용할 경우 추가 크레딧이 소모될 수 있습니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="px-6 py-4 font-medium hover:text-sky-600">
                  결제 방법은 어떤 것을 지원하나요?
                </AccordionTrigger>
                <AccordionContent className="px-6 py-3 text-gray-600">
                  신용카드(VISA, MasterCard, AMEX), 체크카드, PayPal, 그리고
                  국내 주요 간편결제(카카오페이, 네이버페이, 토스페이)를
                  지원합니다. 기업 고객의 경우 세금계산서 발행도 가능합니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="px-6 py-4 font-medium hover:text-sky-600">
                  남은 크레딧은 환불 가능한가요?
                </AccordionTrigger>
                <AccordionContent className="px-6 py-3 text-gray-600">
                  구매 후 7일 이내에 사용하지 않은 크레딧에 한해 부분 환불이
                  가능합니다. 환불 요청은 고객센터를 통해 접수하실 수 있으며,
                  처리 시 수수료가 발생할 수 있습니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.div>

        <motion.div
          {...fadeIn}
          className="text-center mt-20 mb-10 py-8 px-4 max-w-3xl mx-auto bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-4 text-sky-700">
            더 많은 정보가 필요하신가요?
          </h3>
          <p className="mx-auto max-w-2xl mb-6 text-gray-600">
            기업 맞춤형 솔루션이나 대량 구매에 관한 문의는 언제든 환영합니다.
          </p>
          <Button
            variant="outline"
            className="bg-white hover:bg-sky-50 text-sky-600 border-sky-200"
          >
            <strong className="mx-1">support@aiimagesite.com</strong>으로
            문의하기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
