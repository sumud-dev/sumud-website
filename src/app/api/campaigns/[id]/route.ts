import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from "@/src/actions/campaigns.actions";

// GET - Fetch single campaign
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    const { data: campaign, error } = await getCampaignById(id);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 404 }
      );
    }

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

    const { success, error } = await updateCampaign(id, body);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to update campaign" },
        { status: 400 }
      );
    }

    // Fetch the updated campaign to return
    const { data: updatedCampaign, error: fetchError } = await getCampaignById(id);

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError },
        { status: 500 }
      );
    }

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

    const { success, error } = await deleteCampaign(id);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete campaign" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
};
