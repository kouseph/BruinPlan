// app/api/classes/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Class from '@/models/Class';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');
    const department = searchParams.get('department');

    let query = {};
    if (courseCode) {
      query.courseCode = new RegExp(`^${courseCode}$`, 'i');
    }
    if (department) {
      query.department = new RegExp(`^${department}$`, 'i');
    }

    const classes = await Class.find(query).limit(50);
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  // Note: This POST route is for manual additions or testing.
  // Ensure this is protected if it's not just for admin/scraper use.
  // For now, assuming it's for backend/scraper.
  await dbConnect();
  try {
    const body = await request.json();
    const newClass = await Class.create(body);
    return NextResponse.json(
      { success: true, data: newClass },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
