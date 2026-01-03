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
        // Login
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
        navLogout: "Terminate Session",

        // Dashboard
        dashTitle: "Command Center",
        dashSubtitle: "Overview of today's biometric activity",
        dashRefresh: "Refresh",
        dashReport: "Report",
        welcome: "Welcome",
        employeeAccess: "Employee Access",
        limitedAccess: "You have limited access to this system.",
        scanFinger: "Please scan your finger at the terminal to record attendance.",
        totalEmp: "Total Personnel",
        presentToday: "Present Today",
        avgCheckIn: "Avg. Check-In",
        lateArrivals: "Late Arrivals",
        weeklyActivity: "Weekly Activity",
        eventDist: "Event Distribution",
        loadingCharts: "Loading analytics...",

        // Employees
        empTitle: "Personnel Directory",
        empSubtitle: "Manage authorized personnel records",
        empSearch: "Search personnel...",
        empAdd: "Add Personnel",
        empName: "Full Name",
        empDept: "Department",
        empUID: "UID",
        empStatus: "Status",
        empActions: "Actions",
        empActive: "Active",
        empSave: "Save Record",
        empSaving: "Saving...",
        empDeleteTitle: "Terminate Record",
        empDeleteDesc: "Are you sure you want to delete this personnel record? This action cannot be undone.",
        empCancel: "Cancel",
        empConfirmDelete: "Confirm Deletion",
        empNoData: "No personnel records found.",
        empLoading: "Loading directory...",

        // History
        histTitle: "Attendance Logs",
        histSubtitle: "Complete history with analytics",
        histStart: "Start Date",
        histEnd: "End Date",
        histClear: "Clear Filter",
        histExportCSV: "Export CSV",
        histExportPDF: "Export PDF",
        histTime: "Time",
        histEmp: "Employee",
        histEvent: "Event",
        histDevice: "Device",
        histLoading: "Loading history...",
        histNoData: "No records found for this period.",

        // Stats
        statTotalEvents: "Total Events",
        statCheckIns: "Check-Ins",
        statCheckOuts: "Check-Outs",
        statDeptBreakdown: "Department Breakdown",
        statTableDept: "Department",
        statTableTotal: "Total",

        // Settings
        setTitle: "System Settings",
        setSubtitle: "Configure application and hardware parameters",
        setDevice: "Device Configuration",
        setMainNode: "Main ESP32 Node",
        setConnected: "Connected",
        setFirmware: "Firmware Version",
        setCheckUpdate: "Check Update",
        setSecurity: "Security & Account",
        setPassTitle: "Password",
        setPassDesc: "Update your account password for better security.",
        setChangePass: "Change Password",
        setSession: "Session Management",
        setSignOut: "Sign Out",

        // Change Password Modal
        cpTitle: "Change Password",
        cpCurrent: "Current Password",
        cpNew: "New Password",
        cpConfirm: "Confirm New Password",
        cpUpdate: "Update Password",
        cpUpdating: "Updating...",

        // Common
        loading: "Loading...",
        success: "Success",
        error: "Error",
    },
    id: {
        // Login
        loginTitle: "Pusat Komando",
        loginSubtitle: "Kontrol Akses Biometrik Aman",
        usernameLabel: "Nama Pengguna",
        passwordLabel: "Kata Sandi",
        signInButton: "Mulai Sesi",
        signingIn: "Mengautentikasi...",
        installPWA: "Instal di Desktop, Android atau iPhone",
        errorTitle: "Akses Ditolak",

        // Sidebar
        navDashboard: "Pusat Komando",
        navEmployees: "Personil",
        navHistory: "Arsip Log",
        navSettings: "Konfigurasi Sistem",
        navLogout: "Akhiri Sesi",

        // Dashboard
        dashTitle: "Pusat Komando",
        dashSubtitle: "Ringkasan aktivitas biometrik hari ini",
        dashRefresh: "Segarkan",
        dashReport: "Laporan",
        welcome: "Selamat Datang",
        employeeAccess: "Akses Karyawan",
        limitedAccess: "Anda memiliki akses terbatas ke sistem ini.",
        scanFinger: "Silakan pindai jari Anda di terminal untuk merekam kehadiran.",
        totalEmp: "Total Personil",
        presentToday: "Hadir Hari Ini",
        avgCheckIn: "Rata-rata Masuk",
        lateArrivals: "Terlambat",
        weeklyActivity: "Aktivitas Mingguan",
        eventDist: "Distribusi Event",
        loadingCharts: "Memuat analitik...",

        // Employees
        empTitle: "Direktori Personil",
        empSubtitle: "Kelola data personil yang berwenang",
        empSearch: "Cari personil...",
        empAdd: "Tambah Personil",
        empName: "Nama Lengkap",
        empDept: "Departemen",
        empUID: "UID",
        empStatus: "Status",
        empActions: "Aksi",
        empActive: "Aktif",
        empSave: "Simpan Data",
        empSaving: "Menyimpan...",
        empDeleteTitle: "Hapus Data",
        empDeleteDesc: "Apakah Anda yakin ingin menghapus data personil ini? Tindakan ini tidak dapat dibatalkan.",
        empCancel: "Batal",
        empConfirmDelete: "Konfirmasi Hapus",
        empNoData: "Tidak ada data personil ditemukan.",
        empLoading: "Memuat direktori...",

        // History
        histTitle: "Log Kehadiran",
        histSubtitle: "Riwayat lengkap dengan analitik",
        histStart: "Tanggal Mulai",
        histEnd: "Tanggal Akhir",
        histClear: "Hapus Filter",
        histExportCSV: "Ekspor CSV",
        histExportPDF: "Ekspor PDF",
        histTime: "Waktu",
        histEmp: "Karyawan",
        histEvent: "Kejadian",
        histDevice: "Perangkat",
        histLoading: "Memuat riwayat...",
        histNoData: "Tidak ada catatan ditemukan untuk periode ini.",

        // Stats
        statTotalEvents: "Total Event",
        statCheckIns: "Masuk",
        statCheckOuts: "Keluar",
        statDeptBreakdown: "Rincian Departemen",
        statTableDept: "Departemen",
        statTableTotal: "Total",

        // Settings
        setTitle: "Pengaturan Sistem",
        setSubtitle: "Konfigurasi aplikasi dan parameter perangkat keras",
        setDevice: "Konfigurasi Perangkat",
        setMainNode: "Node ESP32 Utama",
        setConnected: "Terhubung",
        setFirmware: "Versi Firmware",
        setCheckUpdate: "Cek Pembaruan",
        setSecurity: "Keamanan & Akun",
        setPassTitle: "Kata Sandi",
        setPassDesc: "Perbarui kata sandi akun Anda untuk keamanan lebih baik.",
        setChangePass: "Ubah Kata Sandi",
        setSession: "Manajemen Sesi",
        setSignOut: "Keluar",

        // Change Password Modal
        cpTitle: "Ubah Kata Sandi",
        cpCurrent: "Kata Sandi Saat Ini",
        cpNew: "Kata Sandi Baru",
        cpConfirm: "Konfirmasi Kata Sandi Baru",
        cpUpdate: "Perbarui Kata Sandi",
        cpUpdating: "Memperbarui...",

        // Common
        loading: "Memuat...",
        success: "Berhasil",
        error: "Kesalahan",
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
            // eslint-disable-next-line
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
