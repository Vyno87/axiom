import { NextResponse } from 'next/server';
import { verifyChain } from '@/lib/blockchain';

export async function GET() {
    try {
        const result = await verifyChain();

        return NextResponse.json({
            ...result,
            message: result.valid ? 'Chain is valid' : 'Chain integrity compromised',
        });
    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
