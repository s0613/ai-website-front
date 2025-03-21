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

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanProps {
  title: string;
  price: number | string;
  originalPrice?: number; // 할인 표시를 위한
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
  // 스타터와 비즈니스 플랜인지 확인
  const isStarterOrBusiness = title === "스타터" || title === "비즈니스";

  return (
    <Card
      className={`h-full flex flex-col relative ${
        recommended ? "border-2 border-primary shadow-lg" : ""
      }`}
    >
      {recommended && (
        <Badge className="absolute right-4 -top-3 font-semibold">추천</Badge>
      )}
      <CardHeader className={`${recommended ? "bg-primary/5" : ""} pb-4`}>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-2 pb-6">
        <div className="text-center mb-6">
          <span className="text-3xl font-bold">
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
          <div className="text-primary font-medium mt-2">
            {credits} 크레딧{" "}
            {!isStarterOrBusiness &&
              (billingType === "yearly" ? "/ 연간" : "/ 월간")}
          </div>
        </div>
        <p className="text-center text-sm mb-6">{description}</p>
        <Separator className="my-6" />
        <div className="mt-4 mb-8 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center">
              {feature.included ? (
                <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
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
            <Link href="/contact">
              <Button
                variant="outline"
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
                size="lg"
              >
                문의하기
              </Button>
            </Link>
          ) : (
            <Button
              variant={recommended ? "default" : "outline"}
              className="w-full"
              size="lg"
            >
              구매하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-16 sm:mb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">크레딧 패키지</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto px-4 mb-8">
          필요한 만큼만 구매하고 원하는 때 사용하세요
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-20 sm:mb-24">
        {plans.map((plan, index) => (
          <div key={index} className="mb-6 sm:mb-0">
            <PlanCard {...plan} billingType={billingType} />
          </div>
        ))}
      </div>

      <div className="mt-16 sm:mt-20 md:mt-24 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          자주 묻는 질문
        </h2>
        <div className="border rounded-lg overflow-hidden max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="px-6 py-4 font-medium">
                크레딧은 얼마나 오래 유효한가요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                크레딧 유효기간은 구매한 패키지에 따라 다릅니다. 스타터는 30일,
                베이직은 45일, 프리미엄은 60일, 비즈니스 패키지는 맞춤형
                유효기간을 제공합니다. 유효기간은 구매일로부터 계산됩니다. 연간
                구독의 경우 크레딧 유효기간이 더 길게 적용됩니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="px-6 py-4 font-medium">
                하나의 이미지 생성에 몇 크레딧이 사용되나요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                기본 이미지 생성은 1크레딧이 소모됩니다. 고해상도 이미지는
                2크레딧, 초고해상도 이미지는 3크레딧이 소모됩니다. 특수 효과나
                고급 편집 기능을 사용할 경우 추가 크레딧이 소모될 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="px-6 py-4 font-medium">
                결제 방법은 어떤 것을 지원하나요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                신용카드(VISA, MasterCard, AMEX), 체크카드, PayPal, 그리고 국내
                주요 간편결제(카카오페이, 네이버페이, 토스페이)를 지원합니다.
                기업 고객의 경우 세금계산서 발행도 가능합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="px-6 py-4 font-medium">
                남은 크레딧은 환불 가능한가요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                구매 후 7일 이내에 사용하지 않은 크레딧에 한해 부분 환불이
                가능합니다. 환불 요청은 고객센터를 통해 접수하실 수 있으며, 처리
                시 수수료가 발생할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="text-center mt-20 mb-10 text-muted-foreground">
        <p className="mx-auto max-w-2xl px-4">
          더 궁금한 점이 있으시면{" "}
          <strong className="font-semibold">support@aiimagesite.com</strong>으로
          문의해 주세요.
        </p>
      </div>
    </div>
  );
}
