import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
    uid: number;
    timestamp: Date;
    status: 'In' | 'Out';
    hash?: string;
    previousHash?: string;
    deviceAuthToken?: string;
}

const AttendanceSchema: Schema = new Schema({
    uid: { type: Number, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['In', 'Out'], required: true },
    hash: { type: String, required: false },
    previousHash: { type: String, required: false },
    deviceAuthToken: { type: String, required: false }, // For extra security later
});

// Prevent model recompilation error in development
const Attendance: Model<IAttendance> =
    mongoose.models.Attendance ||
    mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
