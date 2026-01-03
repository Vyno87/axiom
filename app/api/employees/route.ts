import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance"; // Optional: to cascade delete if needed

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { department: { $regex: query, $options: "i" } },
                ],
            };
        }

        const employees = await Employee.find(filter).sort({ uid: 1 });
        return NextResponse.json({ success: true, data: employees });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const { uid, name, department } = body;

        if (!uid || !name || !department) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if UID exists
        const existing = await Employee.findOne({ uid });
        if (existing) {
            return NextResponse.json({ success: false, error: "UID already exists" }, { status: 409 });
        }

        const newEmployee = await Employee.create(body);
        return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
        }

        const deleted = await Employee.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Employee deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to delete employee" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const { _id, ...updates } = body;

        if (!_id) {
            return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
        }

        const updated = await Employee.findByIdAndUpdate(_id, updates, { new: true });

        if (!updated) {
            return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}
