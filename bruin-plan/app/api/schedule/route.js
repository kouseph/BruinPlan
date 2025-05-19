// app/api/schedule/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if needed
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Class from '@/models/Class';
import mongoose from 'mongoose';

// GET current user's schedule
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  await dbConnect();
  const userId = session.user.id;

  try {
    const user = await User.findById(userId).populate({
      path: 'plannedSchedule.classId',
      model: 'Class',
      select: 'courseCode courseTitle department credits', // Select fields you want from Class
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Further populate section and discussion details if needed
    // This requires more complex population or manual fetching if you want full class/section details
    // For now, returning the IDs stored. You can expand this.
    // Example: To get section details, you'd need to iterate and find them within the populated classId object.

    return NextResponse.json({ success: true, data: user.plannedSchedule });
  } catch (error) {
    console.error(`Error fetching schedule for user ${userId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error while fetching schedule' },
      { status: 500 }
    );
  }
}

// POST to add an item to the current user's schedule
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  await dbConnect();
  const userId = session.user.id;

  try {
    const { classId, sectionId, discussionSectionId } = await request.json();

    if (!classId || !sectionId) {
      return NextResponse.json(
        { success: false, error: 'Class ID and Section ID are required' },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(sectionId) ||
      (discussionSectionId &&
        !mongoose.Types.ObjectId.isValid(discussionSectionId))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format for class, section, or discussion',
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const course = await Class.findOne({
      _id: classId,
      'sections._id': sectionId,
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Class or Section not found' },
        { status: 404 }
      );
    }

    if (discussionSectionId) {
      const sectionObj = course.sections.id(sectionId);
      if (
        !sectionObj ||
        !sectionObj.discussionSections.id(discussionSectionId)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Discussion Section not found within the specified Class/Section',
          },
          { status: 404 }
        );
      }
    }

    const alreadyExists = user.plannedSchedule.some(
      (item) =>
        item.sectionId.equals(sectionId) &&
        ((!item.discussionSectionId && !discussionSectionId) ||
          (item.discussionSectionId &&
            discussionSectionId &&
            item.discussionSectionId.equals(discussionSectionId)))
    );

    if (alreadyExists) {
      return NextResponse.json(
        { success: false, error: 'This item is already in your schedule' },
        { status: 409 }
      );
    }

    const newItem = { classId, sectionId };
    if (discussionSectionId) {
      newItem.discussionSectionId = discussionSectionId;
    }

    user.plannedSchedule.push(newItem);
    await user.save();

    // Optionally, populate the newly added item before sending it back
    // For simplicity, returning the updated schedule array.
    return NextResponse.json(
      { success: true, data: user.plannedSchedule },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error adding to schedule for user ${userId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error while updating schedule' },
      { status: 500 }
    );
  }
}

// DELETE to remove an item from the current user's schedule
// You'd typically pass sectionId and optionally discussionSectionId to identify the item
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  await dbConnect();
  const userId = session.user.id;

  try {
    const { sectionId, discussionSectionId } = await request.json(); // Get IDs from request body

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Section ID is required to remove an item.' },
        { status: 400 }
      );
    }
    if (
      !mongoose.Types.ObjectId.isValid(sectionId) ||
      (discussionSectionId &&
        !mongoose.Types.ObjectId.isValid(discussionSectionId))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format for section or discussion',
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const initialLength = user.plannedSchedule.length;

    user.plannedSchedule = user.plannedSchedule.filter((item) => {
      const sectionMatch = item.sectionId.equals(sectionId);
      const discussionMatch = discussionSectionId
        ? item.discussionSectionId &&
          item.discussionSectionId.equals(discussionSectionId)
        : !item.discussionSectionId; // If no discussionId provided, match items without one or match if item also has no discussionId

      return !(sectionMatch && discussionMatch);
    });

    if (user.plannedSchedule.length === initialLength) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item not found in schedule or IDs did not match.',
        },
        { status: 404 }
      );
    }

    await user.save();
    return NextResponse.json({ success: true, data: user.plannedSchedule });
  } catch (error) {
    console.error(`Error deleting from schedule for user ${userId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Server error while updating schedule' },
      { status: 500 }
    );
  }
}
