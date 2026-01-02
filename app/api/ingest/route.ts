import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import { createBlockHash, getLastHash } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
    try {
        // 1. API Key Validation
        const apiKey = req.headers.get('x-api-key');
        if (apiKey !== process.env.API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { uid, timestamp } = body;

        if (!uid) {
            return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
        }

        await dbConnect();

        // 3. Find Employee
        const employee = await Employee.findOne({ uid });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found', uid },
                { status: 404 }
            );
        }

        // 4. Determine Status (Simple toggle logic for MVP)
        const lastRecord = await Attendance.findOne({ uid }).sort({ timestamp: -1 });
        const newStatus = lastRecord && lastRecord.status === 'In' ? 'Out' : 'In';

        // 5. Get previous hash and create new block hash
        const previousHash = await getLastHash();
        const recordTimestamp = timestamp ? new Date(timestamp) : new Date();
        const hash = createBlockHash(uid, recordTimestamp, newStatus, previousHash);

        // 6. Create Attendance Record with blockchain data
        const attendance = await Attendance.create({
            uid,
            timestamp: recordTimestamp,
            status: newStatus,
            hash,
            previousHash,
            deviceAuthToken: 'ESP32_DEV_V1',
        });

        return NextResponse.json({
            message: 'Success',
            employee: employee.name,
            status: newStatus,
            time: attendance.timestamp,
            hash: attendance.hash,
        });
    } catch (error) {
        console.error('Ingest Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
