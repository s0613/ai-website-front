"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Info, CreditCard, Trash2, AlertCircle } from "lucide-react";
import { BillingService, CreditResponse, CreditTransactionResponse } from "./services/BillingService";
import { toast } from "sonner";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState("20");
  const [balanceThreshold, setBalanceThreshold] = useState("");
  const [creditInfo, setCreditInfo] = useState<CreditResponse | null>(null);
  const [transactions, setTransactions] = useState<CreditTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCreditInfo();
    loadTransactionHistory();
  }, []);

  const loadCreditInfo = async () => {
    try {
      const response = await BillingService.getCurrentCredit();
      setCreditInfo(response);
    } catch (error) {
      toast.error("크레딧 정보를 불러오는데 실패했습니다.");
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const response = await BillingService.getCreditHistory();
      setTransactions(response);
    } catch (error) {
      toast.error("거래 내역을 불러오는데 실패했습니다.");
    }
  };

  const handlePurchaseCredit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const amount = selectedPlan === "custom" ? parseInt(balanceThreshold) : parseInt(selectedPlan);
      await BillingService.chargeCredit({ amount });
      toast.success("크레딧 충전이 완료되었습니다.");
      loadCreditInfo();
      loadTransactionHistory();
    } catch (error) {
      toast.error("크레딧 충전에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">크레딧 충전</h1>
            <p className="text-gray-400">
              크레딧을 충전하여 AI 영상을 생성하세요
            </p>
          </div>
          <Button variant="outline" className="h-10 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
            청구지 주소 수정
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-white">크레딧 현황</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>
                    크레딧 잔액은 최근 사용량이 반영되는데 최대 1시간이 소요될 수 있습니다
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    현재 크레딧
                  </p>
                  <p className="text-3xl font-semibold text-white">{creditInfo?.currentCredit || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    이번 달 사용량
                  </p>
                  <p className="text-3xl font-semibold text-white">
                    {transactions.reduce((acc, curr) => curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0)}
                  </p>
                </div>
              </div>

              <div className="border border-white/20 rounded-md p-4 mb-6 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-medium text-white">크레딧 알림 설정</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  크레딧이 설정한 값 이하로 떨어지면 이메일로 알려드립니다
                </p>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-white">크레딧</span>
                  <Input
                    type="number"
                    value={balanceThreshold}
                    onChange={(e) => setBalanceThreshold(e.target.value)}
                    className="w-32 h-9 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                    placeholder="0"
                  />
                  <Button variant="outline" size="sm" className="h-9 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                    설정
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">크레딧 내역</Button>
              <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">사용 내역</Button>
            </div>
          </Card>

          {/* Right Column - Add Credits */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">크레딧 구매</h2>

            <RadioGroup
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="100" id="option-100" className="border-white/20 text-sky-500" />
                <div className="grid grid-cols-2 w-full">
                  <Label htmlFor="option-100" className="font-medium text-white">
                    100 크레딧
                  </Label>
                  <span className="text-gray-400">
                    ₩10,000 (100원/크레딧)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="500" id="option-500" className="border-white/20 text-sky-500" />
                <div className="grid grid-cols-2 w-full">
                  <Label htmlFor="option-500" className="font-medium text-white">
                    500 크레딧
                  </Label>
                  <span className="text-gray-400">
                    ₩45,000 (90원/크레딧)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1000" id="option-1000" className="border-white/20 text-sky-500" />
                <div className="grid grid-cols-2 w-full">
                  <Label htmlFor="option-1000" className="font-medium text-white">
                    1,000 크레딧
                  </Label>
                  <span className="text-gray-400">
                    ₩80,000 (80원/크레딧)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="custom" id="option-custom" className="border-white/20 text-sky-500" />
                <div className="grid grid-cols-2 w-full">
                  <Label htmlFor="option-custom" className="font-medium text-white">
                    직접 입력
                  </Label>
                  <span className="text-gray-400">
                    원하는 만큼 구매하기
                  </span>
                </div>
              </div>
            </RadioGroup>

            <div className="flex gap-2 mb-6">
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handlePurchaseCredit}
                disabled={isLoading}
              >
                {isLoading ? "처리중..." : selectedPlan === "custom" ? "구매하기" : `${selectedPlan} 크레딧 구매하기`}
              </Button>
              <Input placeholder="쿠폰 코드 입력" className="max-w-[200px] bg-black/40 backdrop-blur-xl border-white/20 text-white" />
              <Button variant="secondary" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">적용</Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-white">자동 충전 설정</span>
              <Button variant="outline" size="sm" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                설정하기
              </Button>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">결제 수단</h2>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">추가</Button>
            </div>

            <div className="flex justify-between items-center p-2">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-white" />
                <div>
                  <span className="font-medium text-white">마스터카드</span> **** 7726
                  <div className="text-sm text-gray-400">
                    만료일: 2027/04
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/60">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Receipts */}
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">결제 내역</h2>

            <div className="grid grid-cols-2 text-sm text-gray-400 mb-2">
              <span>날짜</span>
              <span className="text-right">금액</span>
            </div>

            <div className="border-t border-white/20 py-4 space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <span className="text-white">{new Date(transaction.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-4">
                    <span className={`${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} 크레딧
                    </span>
                    <span className="text-gray-400">{transaction.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
