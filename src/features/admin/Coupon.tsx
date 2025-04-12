"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Coupon {
    id: string
    code: string
    creditAmount: number
    isActive: boolean
    expiryDate: string
}

export default function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        creditAmount: 0,
        expiryDate: "",
    })

    const handleAddCoupon = () => {
        const coupon: Coupon = {
            id: Math.random().toString(36).substr(2, 9),
            ...newCoupon,
            isActive: true,
        }
        setCoupons([...coupons, coupon])
        setNewCoupon({ code: "", creditAmount: 0, expiryDate: "" })
    }

    const handleToggleCoupon = (id: string) => {
        setCoupons(
            coupons.map((coupon) =>
                coupon.id === id
                    ? { ...coupon, isActive: !coupon.isActive }
                    : coupon
            )
        )
    }

    const formatCreditAmount = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount)
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>새 쿠폰 등록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">쿠폰 코드</Label>
                            <Input
                                id="code"
                                value={newCoupon.code}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, code: e.target.value })
                                }
                                placeholder="CREDIT2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creditAmount">충전 크레딧</Label>
                            <Input
                                id="creditAmount"
                                type="number"
                                value={newCoupon.creditAmount}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        creditAmount: Number(e.target.value),
                                    })
                                }
                                placeholder="10000"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">만료일</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={newCoupon.expiryDate}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        expiryDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Button
                        className="mt-4"
                        onClick={handleAddCoupon}
                        disabled={!newCoupon.code || !newCoupon.creditAmount || !newCoupon.expiryDate}
                    >
                        쿠폰 등록
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>쿠폰 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>쿠폰 코드</TableHead>
                                <TableHead>충전 크레딧</TableHead>
                                <TableHead>만료일</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>활성화</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell>{coupon.code}</TableCell>
                                    <TableCell>{formatCreditAmount(coupon.creditAmount)} 크레딧</TableCell>
                                    <TableCell>{coupon.expiryDate}</TableCell>
                                    <TableCell>
                                        {coupon.isActive ? "활성" : "비활성"}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={coupon.isActive}
                                            onCheckedChange={() => handleToggleCoupon(coupon.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
