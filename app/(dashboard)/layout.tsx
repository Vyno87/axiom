import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:pl-64 transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
