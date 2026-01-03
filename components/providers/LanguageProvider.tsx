"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "id";

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        // Login Page
        loginTitle: "Command Center",
        loginSubtitle: "Secure Biometric Access Control",
        usernameLabel: "Username",
        passwordLabel: "Password",
        signInButton: "Initialize Session",
        signingIn: "Authenticating...",
        installPWA: "Install on Desktop, Android or iPhone",
        errorTitle: "Access Denied",

        // Sidebar
        navDashboard: "Command Center",
        navEmployees: "Personnel",
        navHistory: "Log Archive",
        navSettings: "System Config",

        // Common
        loading: "Loading...",
    },
    id: {
        // Login Page
        loginTitle: "Pusat Komando",
        loginSubtitle: "Kontrol Akses Biometrik Aman",
        usernameLabel: "Nama Pengguna",
        passwordLabel: "Kata Sandi",
        signInButton: "Mulai Sesi",
        signingIn: "Mengautentikasi...",
        installPWA: "Instal di Desktop, Android atau iPhone",
        errorTitle: "Akses Ditolak",

        // Sidebar
        navDashboard: "Beranda",
        navEmployees: "Karyawan",
        navHistory: "Riwayat",
        navSettings: "Pengaturan",

        // Common
        loading: "Memuat...",
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem("axiom-lang") as Language;
        if (saved && (saved === "en" || saved === "id")) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("axiom-lang", lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
