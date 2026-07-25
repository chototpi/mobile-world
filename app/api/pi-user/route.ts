export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return Response.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Call Pi Server API to verify and get user info
    const response = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("[v0] Pi API error:", response.statusText);
      return Response.json(
        { error: "Failed to get user info from Pi" },
        { status: response.status }
      );
    }

    const userData = await response.json();
    console.log("[v0] User data from Pi:", userData);

    return Response.json({
      success: true,
      user: {
        uid: userData.uid,
        username: userData.username,
        email: userData.email,
      },
    });
  } catch (error) {
    console.error("[v0] Error getting user info:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
