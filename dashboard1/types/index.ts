export interface Instance {
  id: string
  token: string
  webhookUrl: string
  phoneNumber: string
  status: "connected" | "disconnected" | "connecting"
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  instanceId: string
  type: "text" | "image" | "video" | "audio" | "document"
  from: string
  to: string
  body?: string
  mediaUrl?: string
  timestamp: Date
  status: "pending" | "sent" | "delivered" | "read" | "failed"
}

export interface WebhookPayload {
  instanceId: string
  type: "message" | "status" | "connection"
  data: {
    from?: string
    to?: string
    body?: string
    mediaUrl?: string
    messageId?: string
    status?: string
    timestamp: string
  }
}

export interface SendMessageRequest {
  chatId: string
  message: string
  quotedMessageId?: string
}

export interface SendFileRequest {
  chatId: string
  urlFile: string
  fileName: string
  caption?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
