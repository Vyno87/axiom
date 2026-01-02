import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';

export async function GET() {
    try {
        await dbConnect();

        // Fetch last 20 attendance records with employee details
        const attendanceRecords = await Attendance.find()
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        // Populate employee names
        const enrichedRecords = await Promise.all(
            attendanceRecords.map(async (record) => {
                const employee = await Employee.findOne({ uid: record.uid });
                return {
                    _id: record._id,
                    uid: record.uid,
                    name: employee?.name || 'Unknown',
                    department: employee?.department || 'N/A',
                    timestamp: record.timestamp,
                    status: record.status,
                    hash: record.hash,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: enrichedRecords,
        });
    } catch (error) {
        console.error('Attendance API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
