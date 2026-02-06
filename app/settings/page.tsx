"use client";

import { useState, useEffect } from 'react';
import { FiSettings, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { SiTwilio } from 'react-icons/si';

interface IntegrationStatus {
  name: string;
  connected: boolean;
  icon: React.ReactNode;
  description: string;
  usedBy: string[];
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: 'Twilio',
      connected: false,
      icon: <SiTwilio className="w-8 h-8 text-red-500" />,
      description: 'WhatsApp & SMS notifications for NGO alerts',
      usedBy: ['Negotiator Agent', 'Claim Handler Agent']
    }
  ]);

  const [loading, setLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      const data = await response.json();

      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        connected: data[integration.name.toLowerCase()] || false
      })));
    } catch (error) {
      console.error('Failed to check integration status:', error);
    }
  };

  const handleConnect = async (integrationName: string) => {
    setLoading(integrationName);
    setStatusMessage(null);

    try {
      // Since agents handle OAuth automatically, we just need to trigger the connection
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration: integrationName.toLowerCase() })
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `${integrationName} connected successfully! The agents can now use this integration.`
        });
        await checkIntegrationStatus();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || `Failed to connect ${integrationName}. Please try again.`
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Network error while connecting ${integrationName}. Please check your connection.`
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (integrationName: string) => {
    setLoading(integrationName);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration: integrationName.toLowerCase() })
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `${integrationName} disconnected successfully.`
        });
        await checkIntegrationStatus();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || `Failed to disconnect ${integrationName}.`
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Network error while disconnecting ${integrationName}.`
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FiSettings className="w-8 h-8 text-[#2D5016]" />
          <h1 className="text-3xl font-bold text-gray-900">Integration Settings</h1>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiX className="w-5 h-5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            Agents automatically handle OAuth authentication. Simply click "Connect" below to authorize the integration. The agents will manage the connection and use it as needed.
          </p>
        </div>

        {/* Integrations List */}
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{integration.icon}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        integration.connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {integration.connected ? (
                          <span className="flex items-center gap-1">
                            <FiCheck className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          'Not Connected'
                        )}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {integration.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Used by:</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.usedBy.map((agent) => (
                          <span
                            key={agent}
                            className="px-2 py-1 bg-[#2D5016] bg-opacity-10 text-[#2D5016] rounded text-xs"
                          >
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {integration.connected ? (
                    <>
                      <button
                        onClick={() => checkIntegrationStatus()}
                        disabled={loading === integration.name}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
                      >
                        <FiRefreshCw className={`w-4 h-4 ${loading === integration.name ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.name)}
                        disabled={loading === integration.name}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                      >
                        {loading === integration.name ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.name)}
                      disabled={loading === integration.name}
                      className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a28] transition text-sm font-medium"
                    >
                      {loading === integration.name ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="font-semibold text-[#FF6B35]">1.</span>
              <span>Click "Connect" on the integration you want to authorize.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#FF6B35]">2.</span>
              <span>The agent will handle the OAuth flow automatically in the background.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#FF6B35]">3.</span>
              <span>Once connected, all relevant agents can use this integration without additional setup.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#FF6B35]">4.</span>
              <span>You can disconnect at any time, which will revoke access for all agents.</span>
            </li>
          </ol>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-[#2D5016] hover:text-[#1a300e] font-medium text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
