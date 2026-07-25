import { NextRequest, NextResponse } from "next/server";

// Store user settings (in production, use a real database)
const userSettingsStore: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { piUserId, fullName, phoneNumber, email, country, address } = body;

    // Validation
    if (!piUserId || !fullName || !phoneNumber || !email || !country || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Store user settings
    userSettingsStore[piUserId] = {
      piUserId,
      fullName,
      phoneNumber,
      email,
      country,
      address,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[Server] User settings saved for ${piUserId}:`, userSettingsStore[piUserId]);

    // In production, you would save this to a database here
    // Example with Supabase:
    // const { error } = await supabase
    //   .from('user_settings')
    //   .upsert({
    //     pi_user_id: piUserId,
    //     full_name: fullName,
    //     phone_number: phoneNumber,
    //     email: email,
    //     country: country,
    //     address: address,
    //     updated_at: new Date().toISOString(),
    //   })

    return NextResponse.json(
      {
        message: "Settings saved successfully",
        data: userSettingsStore[piUserId],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const piUserId = request.nextUrl.searchParams.get("piUserId");

    if (!piUserId) {
      return NextResponse.json(
        { error: "Missing piUserId parameter" },
        { status: 400 }
      );
    }

    const settings = userSettingsStore[piUserId];

    if (!settings) {
      return NextResponse.json(
        { message: "No settings found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
