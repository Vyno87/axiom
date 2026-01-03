import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

export async function GET(_req: NextRequest) {
    await dbConnect();

    try {
        // Get all attendance records
        const logs = await Attendance.find().sort({ timestamp: -1 }).limit(500);
        const employees = await Employee.find();

        // Today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLogs = logs.filter(log => new Date(log.timestamp) >= today);

        const totalEmployees = employees.length;
        const presentToday = new Set(todayLogs.filter(l => l.status === "In").map(l => l.uid)).size;

        // Calculate average check-in time (for those who checked in today)
        const checkIns = todayLogs.filter(l => l.status === "In");
        let avgCheckInTime = "N/A";
        if (checkIns.length > 0) {
            const times = checkIns.map(log => {
                const d = new Date(log.timestamp);
                return d.getHours() * 60 + d.getMinutes();
            });
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const hours = Math.floor(avg / 60);
            const mins = Math.floor(avg % 60);
            avgCheckInTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }

        // Late arrivals (after 09:00)
        const lateArrivals = checkIns.filter(log => {
            const d = new Date(log.timestamp);
            const hours = d.getHours();
            return hours >= 9; // Consider late if check-in after 9 AM
        }).length;

        // Weekly trend (last 7 days)
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayLogs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= date && logDate < nextDate;
            });

            const checkInsCount = dayLogs.filter(l => l.status === "In").length;
            const checkOutsCount = dayLogs.filter(l => l.status === "Out").length;

            weeklyTrend.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                checkIns: checkInsCount,
                checkOuts: checkOutsCount,
                total: dayLogs.length,
            });
        }

        // Status distribution (for pie chart or similar)
        const totalCheckIns = logs.filter(l => l.status === "In").length;
        const totalCheckOuts = logs.filter(l => l.status === "Out").length;

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalEmployees,
                    presentToday,
                    avgCheckInTime,
                    lateArrivals,
                },
                weeklyTrend,
                statusDistribution: {
                    checkIns: totalCheckIns,
                    checkOuts: totalCheckOuts,
                },
            },
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
