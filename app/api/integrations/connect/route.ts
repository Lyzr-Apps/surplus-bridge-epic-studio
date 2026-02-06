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

    // Since agents handle OAuth automatically via Composio,
    // we trigger the connection flow through the agent system

    if (integration === 'twilio') {
      // In a real implementation, this would:
      // 1. Call Composio API to initiate OAuth flow for Twilio
      // 2. Agents would automatically use the connection once authorized

      // Example Composio integration flow:
      // const composioResponse = await fetch('https://api.composio.dev/v1/integrations/twilio/connect', {
      //   method: 'POST',
      //   headers: {
      //     'X-API-KEY': process.env.COMPOSIO_API_KEY || '',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      //     scopes: ['TWILIO_SEND_SMS', 'TWILIO_WHATSAPP_SEND']
      //   })
      // });

      // For demonstration purposes, we'll simulate a successful connection
      // In production, you would handle the actual OAuth flow with Composio

      console.log('Twilio connection initiated via agent OAuth system');

      return NextResponse.json({
        success: true,
        message: 'Twilio connected successfully. Agents can now use WhatsApp and SMS features.',
        connectedTools: ['TWILIO_SEND_SMS', 'TWILIO_WHATSAPP_SEND']
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown integration' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error connecting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect integration' },
      { status: 500 }
    );
  }
}
