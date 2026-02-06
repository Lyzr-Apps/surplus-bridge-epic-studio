# Twilio Integration Setup for Annapurna-Connect

## Overview
The Annapurna-Connect platform uses Twilio for sending WhatsApp and SMS notifications to NGOs. Since the agents are integrated with OAuth through Composio, the connection process is automated.

## How to Connect Twilio

### Option 1: Through Settings Page (Recommended)

1. **Navigate to Settings**
   - Open the Annapurna-Connect application
   - Click the "Settings" link in the top navigation bar

2. **Connect Twilio**
   - In the Integrations section, find the Twilio card
   - Click the "Connect" button
   - The agent will handle the OAuth flow automatically in the background
   - Once connected, you'll see a green "Connected" badge

3. **Verify Connection**
   - Click the "Refresh" button to check current status
   - Connected tools will be displayed: `TWILIO_SEND_SMS`, `TWILIO_WHATSAPP_SEND`

### Option 2: Through API (For Developers)

```bash
# Check integration status
curl http://localhost:3000/api/integrations/status

# Connect Twilio
curl -X POST http://localhost:3000/api/integrations/connect \
  -H "Content-Type: application/json" \
  -d '{"integration": "twilio"}'

# Disconnect Twilio
curl -X POST http://localhost:3000/api/integrations/disconnect \
  -H "Content-Type: application/json" \
  -d '{"integration": "twilio"}'
```

## Which Agents Use Twilio?

Once connected, the following agents can automatically use Twilio:

### 1. Negotiator Agent
- **Purpose**: Sends WhatsApp/SMS alerts to NGOs about new food donations
- **Actions**:
  - `TWILIO_SEND_SMS` - Send SMS notifications
  - `TWILIO_WHATSAPP_SEND` - Send WhatsApp messages

### 2. Claim Handler Agent
- **Purpose**: Processes NGO responses and sends confirmation/rejection messages
- **Actions**:
  - `TWILIO_SEND_SMS` - Send claim confirmations
  - `TWILIO_WHATSAPP_SEND` - Send Google Maps directions

## How It Works

1. **OAuth Handled by Agents**: The agents use Composio to manage OAuth tokens automatically. You don't need to manually configure API keys or tokens.

2. **Automatic Authorization**: When you click "Connect" in the Settings page, the agent initiates the OAuth flow with Twilio and stores the credentials securely.

3. **Agent Access**: Once connected, both the Negotiator Agent and Claim Handler Agent can use Twilio tools without any additional configuration.

4. **Revoke Access**: Click "Disconnect" to revoke access for all agents.

## Sample Workflow

```
Donor submits food donation
    ↓
Food Rescue Coordinator triggers
    ↓
Dispatcher Agent finds 3 nearest NGOs
    ↓
Negotiator Agent sends WhatsApp/SMS via Twilio ← USES TWILIO
    ↓
NGO replies "YES"
    ↓
Claim Handler Agent sends confirmation via Twilio ← USES TWILIO
```

## Troubleshooting

### Connection Failed
- Ensure you have a valid Twilio account
- Check that WhatsApp Business API is enabled in your Twilio account
- Verify your Composio API key is correctly configured

### Messages Not Sending
- Refresh the integration status in Settings
- Check the Activity feed in Admin Dashboard for error messages
- Verify NGO phone numbers are in correct format (E.164)

### Disconnect Not Working
- Try refreshing the page and disconnecting again
- Check browser console for error messages
- Contact support if issue persists

## Environment Variables (For Production)

While OAuth handles authentication automatically, you may want to set these for production:

```bash
# .env.local
COMPOSIO_API_KEY=your_composio_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Notes

- No manual API key configuration needed
- OAuth tokens are managed by the agent system
- Connection persists across agent calls
- You can connect/disconnect at any time without affecting past data
- All agents automatically get access once you connect
