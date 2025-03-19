"use client";

import React from "react";
import { Check, ChevronDown } from "lucide-react";
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

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanProps {
  title: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({
  title,
  price,
  period,
  description,
  features,
  recommended = false,
}) => {
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
          <span className="text-3xl font-bold">₩{price.toLocaleString()}</span>
          <span className="text-muted-foreground">/{period}</span>
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
          <Button
            variant={recommended ? "default" : "outline"}
            className="w-full"
            size="lg"
          >
            선택하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MembershipPlan() {
  const plans = [
    {
      title: "Beginner Plan",
      price: "무료",
      period: "월",
      description: "개인 사용자를 위한 기본 기능",
      features: [
        { text: "월 50개 이미지 생성", included: true },
        { text: "기본 이미지 편집 도구", included: true },
        { text: "표준 해상도", included: true },
        { text: "이메일 지원", included: true },
        { text: "AI 스타일 추천", included: false },
        { text: "무제한 이미지 저장", included: false },
      ],
      recommended: false,
    },
    {
      title: "Basic Plan",
      price: 29900,
      period: "월",
      description: "전문가를 위한 고급 기능",
      features: [
        { text: "월 200개 이미지 생성", included: true },
        { text: "고급 이미지 편집 도구", included: true },
        { text: "고해상도 출력", included: true },
        { text: "우선 이메일 지원", included: true },
        { text: "AI 스타일 추천", included: true },
        { text: "무제한 이미지 저장", included: true },
      ],
      recommended: true,
    },
    {
      title: "premium Plan",
      price: 1399000,
      period: "월",
      description: "팀과 기업을 위한 솔루션",
      features: [
        { text: "월 500개 이미지 생성", included: true },
        { text: "전체 편집 기능 액세스", included: true },
        { text: "최대 해상도 출력", included: true },
        { text: "24/7 전용 지원", included: true },
        { text: "팀 협업 기능", included: true },
        { text: "API 액세스", included: true },
      ],
      recommended: false,
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-16 sm:mb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">멤버십 플랜</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          당신의 창의적인 프로젝트에 맞는 최적의 플랜을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 sm:mb-24">
        {plans.map((plan, index) => (
          <div key={index} className="mb-6 sm:mb-0">
            <PlanCard {...plan} />
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
                구독은 언제든지 취소할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                네, 언제든지 구독을 취소할 수 있으며 다음 결제일 전까지 서비스를
                계속 이용할 수 있습니다. 취소 시 별도의 위약금이나 추가 비용은
                발생하지 않습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="px-6 py-4 font-medium">
                플랜은 어떻게 업그레이드하나요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                계정 설정에서 언제든지 플랜을 변경할 수 있습니다. 상위 플랜으로
                업그레이드하면 즉시 새로운 기능을 이용할 수 있으며, 남은 기간에
                대해 비례 계산된 차액만 지불하시면 됩니다.
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
                생성된 이미지의 저작권은 어떻게 되나요?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-3">
                귀하가 생성한 모든 이미지의 저작권은 귀하에게 있습니다. 상업적
                용도를 포함한 모든 목적으로 자유롭게 사용할 수 있습니다. 다만,
                불법적인 콘텐츠 생성은 이용약관에 위배됩니다.
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
