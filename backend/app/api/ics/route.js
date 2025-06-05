// App-router API endpoint
// -------------------------------------------------------------
// GET /api/ics?googleId=XXXXXXXX&scheduleIndex=0
// -------------------------------------------------------------
import { NextResponse } from 'next/server';
import { createIcs }    from 'backend/lib/createIcs.js';

// If on the edge runtime, comment this out.
// We need full Node for mongoose.
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const googleId      = searchParams.get('googleId');       // required
  const scheduleIndex = Number(searchParams.get('scheduleIndex') ?? 0);

  if (!googleId) {
    return NextResponse.json(
      { error: 'Missing googleId query parameter' },
      { status: 400 }
    );
  }

  try {
    const icsText = await createIcs({ googleId, scheduleIndex });

    return new NextResponse(icsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bruinplan-schedule.ics"',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(icsText, 'utf-8').toString()
      }
    });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}