// src/app/providers.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/features/user/AuthContext";
import { CreditProvider } from "@/features/payment/context/CreditContext";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <CreditProvider>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </CreditProvider>
    );
}
