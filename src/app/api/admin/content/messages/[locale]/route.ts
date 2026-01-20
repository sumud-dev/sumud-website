import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    // Validate locale
    const validLocales = ["en", "fi"];
    if (!validLocales.includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      );
    }

    // Read the messages file
    const filePath = join(process.cwd(), "messages", `${locale}.json`);
    const fileContent = await readFile(filePath, "utf-8");
    const messages = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error loading messages:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}
