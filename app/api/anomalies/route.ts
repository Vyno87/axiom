import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';

export async function GET() {
    try {
        await dbConnect();

        // Define unusual hours (before 6 AM or after 10 PM)
        const records = await Attendance.find().sort({ timestamp: -1 }).limit(100).lean();

        const anomalies = await Promise.all(
            records
                .filter((record) => {
                    const hour = new Date(record.timestamp).getHours();
                    return hour < 6 || hour >= 22;
                })
                .map(async (record) => {
                    const employee = await Employee.findOne({ uid: record.uid });
                    return {
                        uid: record.uid,
                        name: employee?.name || 'Unknown',
                        timestamp: record.timestamp,
                        hour: new Date(record.timestamp).getHours(),
                        status: record.status,
                    };
                })
        );

        // Count anomalies by hour
        const hourlyAnomalies = Array(24).fill(0);
        records.forEach((record) => {
            const hour = new Date(record.timestamp).getHours();
            if (hour < 6 || hour >= 22) {
                hourlyAnomalies[hour]++;
            }
        });

        return NextResponse.json({
            success: true,
            anomalies,
            hourlyDistribution: hourlyAnomalies.map((count, hour) => ({
                hour,
                count,
            })),
        });
    } catch (error) {
        console.error('Anomalies API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
