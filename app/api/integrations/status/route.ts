import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check integration status
    // Since agents handle OAuth automatically via Composio,
    // we check if the tools are available and authorized

    const integrationStatus = {
      twilio: false, // Default to false, will be true if connected
    };

    // In a real implementation, you would check with Composio API
    // to verify if the Twilio integration is connected and authorized
    // For now, we'll simulate this check

    // Example: Check if TWILIO_SEND_SMS tool is available
    // This would typically involve calling the Composio API
    // const composioResponse = await fetch('https://api.composio.dev/v1/integrations/twilio/status', {
    //   headers: {
    //     'X-API-KEY': process.env.COMPOSIO_API_KEY || ''
    //   }
    // });

    // For demonstration, we'll check environment variables
    // In production, this would check actual OAuth token status with Composio
    if (process.env.TWILIO_CONNECTED === 'true') {
      integrationStatus.twilio = true;
    }

    return NextResponse.json(integrationStatus);
  } catch (error) {
    console.error('Error checking integration status:', error);
    return NextResponse.json(
      { error: 'Failed to check integration status' },
      { status: 500 }
    );
  }
}
