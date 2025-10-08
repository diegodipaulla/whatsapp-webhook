"use client"

import { useState, useEffect } from "react"
import { SettingsIcon, Save, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SettingsPage() {
  const [instanceId, setInstanceId] = useState("")
  const [token, setToken] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Load from localStorage
    const savedInstanceId = localStorage.getItem("instanceId")
    const savedToken = localStorage.getItem("token")

    if (savedInstanceId && savedToken) {
      setInstanceId(savedInstanceId)
      setToken(savedToken)
      loadSettings(savedInstanceId, savedToken)
    }
  }, [])

  const loadSettings = async (id: string, tok: string) => {
    try {
      const response = await fetch(`/api/instance/${id}/settings`, {
        headers: { Authorization: `Bearer ${tok}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPhoneNumber(data.data.phoneNumber)
        setWebhookUrl(data.data.webhookUrl)
        setStatus(data.data.status)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const createInstance = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/instance/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, webhookUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setInstanceId(data.data.instanceId)
        setToken(data.data.token)
        localStorage.setItem("instanceId", data.data.instanceId)
        localStorage.setItem("token", data.data.token)
        setMessage("Instance created successfully!")
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage("Failed to create instance")
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async () => {
    if (!instanceId || !token) {
      setMessage("Please create an instance first")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/instance/${instanceId}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber, webhookUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Settings updated successfully!")
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage("Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: typeof status) => {
    if (!instanceId || !token) return

    try {
      const response = await fetch(`/api/instance/${instanceId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.success) {
        setStatus(newStatus)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-600">Configure your WhatsApp instance</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instance Information</h2>

          {instanceId ? (
            <div className="space-y-4 mb-6">
              <div>
                <Label>Instance ID</Label>
                <Input value={instanceId} readOnly className="font-mono text-sm" />
              </div>
              <div>
                <Label>API Token</Label>
                <Input type="password" value={token} readOnly className="font-mono text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === "connected"
                      ? "bg-green-100 text-green-800"
                      : status === "connecting"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {status}
                </span>
                {status === "disconnected" && (
                  <Button size="sm" onClick={() => updateStatus("connected")} className="ml-2">
                    Connect
                  </Button>
                )}
                {status === "connected" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus("disconnected")} className="ml-2">
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">No instance created yet</p>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://your-app.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">URL to receive incoming messages and events</p>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {!instanceId ? (
              <Button onClick={createInstance} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Instance"
                )}
              </Button>
            ) : (
              <Button onClick={updateSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Start</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Enter your phone number and webhook URL</li>
            <li>Click "Create Instance" to generate your API credentials</li>
            <li>Save your Instance ID and Token securely</li>
            <li>Click "Connect" to activate your instance</li>
            <li>Use the API token in your requests (see Documentation)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
