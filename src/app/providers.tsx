// src/app/providers.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/features/user/AuthContext";
import { CreditProvider } from "@/features/payment/context/CreditContext";

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <CreditProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </CreditProvider>
        </SessionProvider>
    );
}
