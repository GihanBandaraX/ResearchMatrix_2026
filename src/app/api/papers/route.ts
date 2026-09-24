import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Paper from '../../../models/Paper';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch papers belonging to this user, latest first
    const papers = await Paper.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, papers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching papers history:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}