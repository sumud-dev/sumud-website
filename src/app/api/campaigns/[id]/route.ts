import { NextRequest, NextResponse } from "next/server";

// GET - Fetch single campaign
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // TODO: Replace with your actual database query
    // Example: const campaign = await db.campaign.findUnique({ where: { id } });
    
    // Mock data for demonstration
    const campaign = {
      id,
      title: "Sample Campaign",
      description: "This is a sample campaign description.",
      goal: 10000,
      currentAmount: 5000,
      status: "active",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
};

// PATCH - Update campaign
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    const { title, description, goal, status, startDate, endDate, imageUrl } = body;

    // Validate required fields
    if (!title || !description || !goal || !status || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database update
    // Example: const updatedCampaign = await db.campaign.update({
    //   where: { id },
    //   data: { title, description, goal, status, startDate, endDate, imageUrl }
    // });

    const updatedCampaign = {
      id,
      title,
      description,
      goal,
      status,
      startDate,
      endDate,
      imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: updatedCampaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
};

// DELETE - Delete campaign
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // TODO: Replace with your actual database delete
    // Example: await db.campaign.delete({ where: { id } });

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
};
