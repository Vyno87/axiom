import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';

export async function GET() {
    await dbConnect();
    try {
        const testEmployee = await Employee.findOneAndUpdate(
            { uid: 1 },
            { name: 'John Doe', department: 'Engineering', isActive: true },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, employee: testEmployee });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
