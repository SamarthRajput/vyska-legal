import { isAdmin } from '@/actions/syncUser';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const adminCheck = await isAdmin();
    
    return NextResponse.json({ isAdmin: adminCheck }, { status: 200 });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
