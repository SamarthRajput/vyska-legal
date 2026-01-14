import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();

    const forwardedFor = headersList.get('x-forwarded-for');
    let ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : headersList.get('x-real-ip') ||
      'unknown';

    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
      ip = 'localhost';
    }

    console.log('Checking consent for IP:', ip);

    const existingConsent = await prisma.consent.findFirst({
      where: {
        ip: ip,
        consent: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      hasConsented: !!existingConsent,
      lastConsent: existingConsent ? existingConsent.createdAt : null,
      consentId: existingConsent ? existingConsent.id : null
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking consent:', error);
    return NextResponse.json(
      { hasConsented: false, error: 'Failed to check consent' },
      { status: 500 }
    );
  }
}
