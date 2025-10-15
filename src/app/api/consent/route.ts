import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const headersList = await headers();
        let ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
                headersList.get('x-real-ip') || 
                'unknown';

        if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
            ip = 'localhost';
        }

        console.log('Recording consent for IP:', ip);

        const userAgent = headersList.get('user-agent') || '';
        const acceptLanguage = headersList.get('accept-language') || '';
        const referer = headersList.get('referer') || '';

        const consentRecord = await prisma.consent.create({
        data: {
            ip: ip,
            consent: body.consent,
            timestamp: new Date(body.timestamp),
            userAgent: userAgent,
            language: acceptLanguage,
            referer: referer,
        }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Consent recorded',
            visitorId: consentRecord.id
        });
    } catch (error) {
            console.error('Error recording consent:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to record consent' },
            { status: 500 }
        );
    }
}
