import { NextResponse } from 'next/server';
import { createIcs } from 'backend/lib/createIcs.js';

export const runtime = 'nodejs'; // Ensure Node (not Edge) for Mongoose

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const googleId = searchParams.get('googleId');
  const scheduleIndex = Number(searchParams.get('scheduleIndex') ?? 0);

  if (!googleId) {
    return NextResponse.json({ error: 'Missing googleId query parameter' }, { status: 400 });
  }

  try {
    const icsText = await createIcs({ googleId, scheduleIndex });

    return new NextResponse(icsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="schedule.ics"'
      }
    });
  } catch (err) {
    console.error('Error generating ICS:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
