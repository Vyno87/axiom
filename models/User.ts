import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string; // In production, use bcrypt hash
    name: string;
    email?: string;
    role: 'admin' | 'user';
    employeeId?: number; // Link to Employee UID
    isActive: boolean;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    name: { type: String, required: true },
    email: { type: String, required: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    employeeId: { type: Number, required: false }, // Reference to Employee.uid
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
