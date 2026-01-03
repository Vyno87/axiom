import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        // Find the user
        // Note: session.user.id needs to be cast properly or handled
        // In auth.ts we returned id as string.
        const user = await User.findById((session.user as any).id);

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Verify current password (simple comparison as per current auth implementation)
        // Production should use bcrypt.compare
        if (user.password !== currentPassword) {
            return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
        }

        // Update password
        user.password = newPassword;
        // In production, user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
