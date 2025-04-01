"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Info, CreditCard, Trash2, AlertCircle } from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState("20");
  const [balanceThreshold, setBalanceThreshold] = useState("");

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Billing and payment information
          </p>
        </div>
        <Button variant="outline" className="h-10">
          Update Billing Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card className="p-6 border">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">Credits</h2>
              <div className="flex items-center text-muted-foreground text-sm">
                <Info className="h-4 w-4 mr-1" />
                <span>
                  Balance updates may take up to one hour to reflect recent
                  usage
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current balance
                </p>
                <p className="text-3xl font-semibold">$0.10</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current month spend
                </p>
                <p className="text-3xl font-semibold">$9.90</p>
              </div>
            </div>

            <div className="border rounded-md p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-medium">Get a balance notification</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Set a balance threshold, which will trigger an email
                notification.
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">USD</span>
                <Input
                  type="number"
                  value={balanceThreshold}
                  onChange={(e) => setBalanceThreshold(e.target.value)}
                  className="w-32 h-9"
                  placeholder="0"
                />
                <Button variant="outline" size="sm" className="h-9">
                  Set
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">View Credit Details</Button>
            <Button variant="outline">View charges</Button>
          </div>
        </Card>

        {/* Right Column - Add Credits */}
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">Add Credits</h2>

          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="space-y-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="10" id="option-10" />
              <div className="grid grid-cols-2 w-full">
                <Label htmlFor="option-10" className="font-medium">
                  $10
                </Label>
                <span className="text-muted-foreground">
                  Approx. 4.5k images using SDXL with defaults
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="20" id="option-20" />
              <div className="grid grid-cols-2 w-full">
                <Label htmlFor="option-20" className="font-medium">
                  $20
                </Label>
                <span className="text-muted-foreground">
                  Approx. 9k images using SDXL with defaults
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="50" id="option-50" />
              <div className="grid grid-cols-2 w-full">
                <Label htmlFor="option-50" className="font-medium">
                  $50
                </Label>
                <span className="text-muted-foreground">
                  Approx. 23k images using SDXL with defaults
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <RadioGroupItem value="custom" id="option-custom" />
              <div className="grid grid-cols-2 w-full">
                <Label htmlFor="option-custom" className="font-medium">
                  Custom
                </Label>
                <span className="text-muted-foreground">
                  Buy any amount of credits
                </span>
              </div>
            </div>
          </RadioGroup>

          <div className="flex gap-2 mb-6">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Buy $20.00
            </Button>
            <Input placeholder="Enter coupon code" className="max-w-[200px]" />
            <Button variant="secondary">Redeem</Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Automated top ups</span>
            <Button variant="outline" size="sm">
              Set up
            </Button>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
          </div>

          <div className="flex justify-between items-center p-2">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <div>
                <span className="font-medium">Mastercard</span> ending in 7726
                <div className="text-sm text-muted-foreground">
                  Expires 4/2027
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Receipts */}
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">Receipts</h2>

          <div className="grid grid-cols-2 text-sm text-muted-foreground mb-2">
            <span>DATE</span>
            <span className="text-right">AMOUNT</span>
          </div>

          <div className="border-t py-4 flex justify-between items-center">
            <span>March 8th, 2025 at 2:00:03 PM GMT+9</span>
            <div className="flex items-center gap-4">
              <span>$10.00</span>
              <Button variant="outline" size="sm">
                Receipt
              </Button>
            </div>
          </div>
        </Card>

        {/* Invoices */}
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">Invoices</h2>

          <div className="grid grid-cols-2 text-sm text-muted-foreground mb-2">
            <span>DATE</span>
            <span className="text-right">AMOUNT</span>
          </div>

          <div className="border-t py-4 flex justify-between items-center">
            <span>March 8th, 2025</span>
            <div className="flex items-center gap-4">
              <span>$10.00</span>
              <Button variant="outline" size="sm">
                Invoice
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
