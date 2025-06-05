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

  console.log('ICS Export - Request params:', { googleId, scheduleIndex });

  if (!googleId) {
    console.log('ICS Export - Missing googleId');
    return NextResponse.json(
      { error: 'Missing googleId query parameter' },
      { status: 400 }
    );
  }

  try {
    console.log('ICS Export - Generating calendar...');
    const icsText = await createIcs({ googleId, scheduleIndex });
    
    console.log('ICS Export - Calendar generated, first 100 chars:', icsText.substring(0, 100));
    
    // Create response with proper headers
    const response = new NextResponse(icsText, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bruinplan-schedule.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Length': Buffer.byteLength(icsText, 'utf-8').toString()
      })
    });

    // Ensure no HTML content
    response.headers.delete('X-Content-Type-Options');
    console.log('ICS Export - Response headers:', Object.fromEntries(response.headers.entries()));
    return response;
    
  } catch (err) {
    console.error('ICS Generation Error:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json(
      { error: 'Failed to generate calendar file', details: err.message },
      { status: 500 }
    );
  }
}