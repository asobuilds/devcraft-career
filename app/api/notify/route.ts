import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate the request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { profileName, subdomain } = body;

    // 2. Ensure required fields are present
    if (!profileName || typeof profileName !== 'string' || profileName.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid "profileName" (must be a non‑empty string)' },
        { status: 400 }
      );
    }
    if (!subdomain || typeof subdomain !== 'string' || subdomain.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid "subdomain" (must be a non‑empty string)' },
        { status: 400 }
      );
    }

    // 3. Simulate a telemetry / notification dispatch (e.g., to Resend, SendGrid, or a queue)
    console.log(
      `📡 TELEMETRY ENGINE TRIGGERED: Recruiter accessed vanity node address link card: "${subdomain}" belonging to: "${profileName}"`
    );

    // Here you would integrate with your actual email or webhook service.
    // For now, we just log and prepare a success response.
    const telemetryReportPayload = {
      alertDispatched: true,
      timestamp: new Date().toISOString(),
      message: `Notification loop simulated successfully. Alert generated for ${profileName}.`,
      subdomain,
      profileName,
    };

    return NextResponse.json(telemetryReportPayload, { status: 200 });
  } catch (error: any) {
    console.error('Telemetry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error – notification pipeline fault' },
      { status: 500 }
    );
  }
}