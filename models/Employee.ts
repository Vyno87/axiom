import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
    uid: number;
    name: string;
    department: string;
    isActive: boolean;
    joinedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
    uid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
});

const Employee: Model<IEmployee> =
    mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
