"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    email: string;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
            setIsLoggedIn(true);
        }
    }, []);

    const login = (email: string) => {
        setEmail(email);
        setIsLoggedIn(true);
        localStorage.setItem('email', email);
    };

    const logout = () => {
        setEmail('');
        setIsLoggedIn(false);
        localStorage.removeItem('email');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, email, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};