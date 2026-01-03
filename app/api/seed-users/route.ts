import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(_req: NextRequest) {
    try {
        await dbConnect();

        // Clear existing users
        await User.deleteMany({});

        // Seed Admin and Demo User
        const users = [
            {
                username: 'admin',
                password: 'admin123', // In production, use bcrypt.hash()
                name: 'Admin System',
                email: 'admin@axiom.id',
                role: 'admin',
                isActive: true,
            },
            {
                username: 'user',
                password: 'user123',
                name: 'Demo Employee',
                email: 'user@axiom.id',
                role: 'user',
                employeeId: 1, // Link to an employee
                isActive: true,
            },
        ];

        await User.insertMany(users);

        return NextResponse.json({
            success: true,
            message: 'Users seeded successfully',
            count: users.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to seed users', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
