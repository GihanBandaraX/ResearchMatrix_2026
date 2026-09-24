import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Paper from '../../../../models/Paper';

// DELETE: Permanently delete a paper from MongoDB
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params; // Await params for Next.js App Router compatibility

    const deletedPaper = await Paper.findByIdAndDelete(id);

    if (!deletedPaper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Paper deleted permanently from database' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting paper:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Permanently update paper properties (Title / Pin status)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params; // Await params for Next.js App Router compatibility
    const body = await req.json();

    // Update only the provided fields (e.g., title or isPinned)
    const updatedPaper = await Paper.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedPaper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, paper: updatedPaper }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating paper:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}