"use client";

import { useCredit } from "@/features/payment/context/CreditContext";

export default function Navbar() {
    const { credits } = useCredit();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <div className="text-white bg-sky-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
                            {credits.toLocaleString()} 크레딧
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
} 