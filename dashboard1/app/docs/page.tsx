"use client"

import { FileText, Code, Key, Send } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">API Documentation</h1>
          </div>
          <p className="text-gray-600">Complete reference for the WhatsApp API</p>
        </div>

        <div className="space-y-8">
          {/* Authentication */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Authentication</h2>
            </div>
            <p className="text-gray-700 mb-4">
              All API requests require authentication using a Bearer token in the Authorization header.
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`Authorization: Bearer YOUR_API_TOKEN`}</pre>
            </div>
          </section>

          {/* Create Instance */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create Instance</h2>
            <p className="text-gray-700 mb-4">Create a new WhatsApp instance to start sending messages.</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">POST</span>
                  <code className="text-sm">/api/instance/create</code>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "phoneNumber": "+5511999999999",
  "webhookUrl": "https://your-app.com/webhook"
}`}</pre>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Response:</p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "success": true,
  "data": {
    "instanceId": "inst_1234567890_abc123",
    "token": "tok_1234567890_xyz789abc",
    "phoneNumber": "+5511999999999",
    "webhookUrl": "https://your-app.com/webhook"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Send Message */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Send Message</h2>
            </div>
            <p className="text-gray-700 mb-4">Send a text message to a WhatsApp number.</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">POST</span>
                  <code className="text-sm">/api/instance/{"{instanceId}"}/sendMessage</code>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "chatId": "5511999999999@c.us",
  "message": "Hello from WhatsApp API!",
  "quotedMessageId": "optional_message_id"
}`}</pre>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Response:</p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "success": true,
  "data": {
    "messageId": "msg_1234567890_xyz",
    "status": "pending",
    "timestamp": "2025-01-10T12:00:00.000Z"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Send File */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Send File</h2>
            <p className="text-gray-700 mb-4">Send a file (image, video, audio, or document) via URL.</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">POST</span>
                  <code className="text-sm">/api/instance/{"{instanceId}"}/sendFileByUrl</code>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "chatId": "5511999999999@c.us",
  "urlFile": "https://example.com/image.jpg",
  "fileName": "image.jpg",
  "caption": "Check this out!"
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Get Messages */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Get Messages</h2>
            <p className="text-gray-700 mb-4">Retrieve messages from the queue.</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">GET</span>
                  <code className="text-sm">/api/instance/{"{instanceId}"}/messages?limit=100</code>
                </div>
              </div>
            </div>
          </section>

          {/* Instance Status */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Instance Status</h2>
            <p className="text-gray-700 mb-4">Check or update the connection status of your instance.</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">GET</span>
                  <code className="text-sm">/api/instance/{"{instanceId}"}/status</code>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">POST</span>
                  <code className="text-sm">/api/instance/{"{instanceId}"}/status</code>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "status": "connected" // or "disconnected", "connecting"
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Webhooks */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
            <p className="text-gray-700 mb-4">Receive incoming messages and events via webhooks.</p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">
                  Configure your webhook URL in Settings, then receive POST requests:
                </p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "instanceId": "inst_1234567890_abc123",
  "type": "message",
  "data": {
    "from": "5511999999999@c.us",
    "to": "5511888888888@c.us",
    "body": "Hello!",
    "messageId": "msg_xyz",
    "timestamp": "2025-01-10T12:00:00.000Z"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Code Examples</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">JavaScript / Node.js</h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`const instanceId = 'your_instance_id';
const token = 'your_api_token';

// Send a message
const response = await fetch(
  \`http://localhost:3000/api/instance/\${instanceId}/sendMessage\`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      chatId: '5511999999999@c.us',
      message: 'Hello from Node.js!'
    })
  }
);

const data = await response.json();
console.log(data);`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Python</h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`import requests

instance_id = 'your_instance_id'
token = 'your_api_token'

# Send a message
response = requests.post(
    f'http://localhost:3000/api/instance/{instance_id}/sendMessage',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    json={
        'chatId': '5511999999999@c.us',
        'message': 'Hello from Python!'
    }
)

print(response.json())`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">cURL</h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X POST http://localhost:3000/api/instance/YOUR_INSTANCE_ID/sendMessage \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d '{
    "chatId": "5511999999999@c.us",
    "message": "Hello from cURL!"
  }'`}</pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
