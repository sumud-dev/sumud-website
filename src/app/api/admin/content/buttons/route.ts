import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { locale, messages } = await request.json();

    if (!locale || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate locale
    const validLocales = ["en", "fi"];
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      );
    }

    // Write the updated messages to the file
    const filePath = join(process.cwd(), "messages", `${locale}.json`);
    await writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Buttons updated successfully for ${locale}`,
    });
  } catch (error) {
    console.error("Error saving buttons:", error);
    return NextResponse.json(
      { error: "Failed to save buttons" },
      { status: 500 }
    );
  }
}
