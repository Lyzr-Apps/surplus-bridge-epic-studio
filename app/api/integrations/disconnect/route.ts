import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { integration } = await request.json();

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration name is required' },
        { status: 400 }
      );
    }

    if (integration === 'twilio') {
      // In a real implementation, this would:
      // 1. Call Composio API to revoke OAuth tokens for Twilio
      // 2. Agents would no longer have access to Twilio tools

      // Example Composio disconnection:
      // const composioResponse = await fetch('https://api.composio.dev/v1/integrations/twilio/disconnect', {
      //   method: 'POST',
      //   headers: {
      //     'X-API-KEY': process.env.COMPOSIO_API_KEY || '',
      //   }
      // });

      console.log('Twilio disconnected from agent OAuth system');

      return NextResponse.json({
        success: true,
        message: 'Twilio disconnected successfully. Agents no longer have access to this integration.'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown integration' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
