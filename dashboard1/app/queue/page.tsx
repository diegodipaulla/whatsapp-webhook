"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormattedWhatsappText } from "@/components/formatted-whatsapp-text"
import Link from "next/link"
import type { Message } from "@/types"

export default function QueuePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [instanceId, setInstanceId] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    const savedInstanceId = localStorage.getItem("instanceId")
    const savedToken = localStorage.getItem("token")

    if (savedInstanceId && savedToken) {
      setInstanceId(savedInstanceId)
      setToken(savedToken)
      loadMessages(savedInstanceId, savedToken)
    }
  }, [])

  const loadMessages = async (id: string, tok: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/instance/${id}/messages`, {
        headers: { Authorization: `Bearer ${tok}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.data.messages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = async () => {
    if (!instanceId || !token) return

    try {
      const response = await fetch(`/api/instance/${instanceId}/messages`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to clear messages:", error)
    }
  }

  const refresh = () => {
    if (instanceId && token) {
      loadMessages(instanceId, token)
    }
  }

  if (!instanceId || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Instance Found</h2>
          <p className="text-gray-600 mb-4">Please create an instance in Settings first</p>
          <Link href="/settings">
            <Button>Go to Settings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-8 h-8 text-green-600" />
                <h1 className="text-3xl font-bold">Message Queue</h1>
              </div>
              <p className="text-gray-600">
                {messages.length} message{messages.length !== 1 ? "s" : ""} in queue
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={refresh} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={clearMessages} variant="outline" disabled={messages.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
            <p className="text-gray-500">Messages will appear here when you send or receive them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {message.from === instanceId ? "You" : message.from}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-600">{message.to}</span>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : message.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : message.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {message.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {message.type}
                    </span>
                  </div>
                </div>

                {message.body && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <FormattedWhatsappText text={message.body} />
                  </div>
                )}

                {message.mediaUrl && (
                  <div className="mt-3">
                    <a
                      href={message.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      View Media →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
