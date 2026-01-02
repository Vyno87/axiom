import crypto from 'crypto';
import dbConnect from './mongodb';
import Attendance from '@/models/Attendance';

/**
 * Generates a SHA-256 hash from an object
 */
export function generateHash(data: object): string {
    const stringified = JSON.stringify(data);
    return crypto.createHash('sha256').update(stringified).digest('hex');
}

/**
 * Creates a block hash for an attendance record
 */
export function createBlockHash(
    uid: number,
    timestamp: Date,
    status: string,
    previousHash: string
): string {
    const blockData = {
        uid,
        timestamp: timestamp.toISOString(),
        status,
        previousHash,
    };
    return generateHash(blockData);
}

/**
 * Gets the hash of the last attendance record
 */
export async function getLastHash(): Promise<string> {
    await dbConnect();
    const lastRecord = await Attendance.findOne().sort({ timestamp: -1 });
    return lastRecord?.hash || 'GENESIS_BLOCK';
}

/**
 * Verifies the integrity of the entire attendance chain
 */
export async function verifyChain(): Promise<{
    valid: boolean;
    totalRecords: number;
    brokenAt?: number;
    invalidRecord?: object;
}> {
    await dbConnect();

    const records = await Attendance.find().sort({ timestamp: 1 });

    if (records.length === 0) {
        return { valid: true, totalRecords: 0 };
    }

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const expectedPreviousHash = i === 0 ? 'GENESIS_BLOCK' : records[i - 1].hash;

        // Check if previousHash matches
        if (record.previousHash !== expectedPreviousHash) {
            return {
                valid: false,
                totalRecords: records.length,
                brokenAt: i,
                invalidRecord: {
                    _id: record._id,
                    uid: record.uid,
                    timestamp: record.timestamp,
                },
            };
        }

        // Recalculate and verify the hash
        const recalculatedHash = createBlockHash(
            record.uid,
            record.timestamp,
            record.status,
            record.previousHash
        );

        if (record.hash !== recalculatedHash) {
            return {
                valid: false,
                totalRecords: records.length,
                brokenAt: i,
                invalidRecord: {
                    _id: record._id,
                    uid: record.uid,
                    timestamp: record.timestamp,
                    reason: 'Hash mismatch',
                },
            };
        }
    }

    return { valid: true, totalRecords: records.length };
}
