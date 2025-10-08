import type { Message, SendMessageRequest, SendFileRequest } from "@/types"
import { storage } from "./storage"

export class WhatsAppService {
  async sendMessage(instanceId: string, request: SendMessageRequest): Promise<Message> {
    const instance = storage.getInstance(instanceId)
    if (!instance) {
      throw new Error("Instance not found")
    }

    if (instance.status !== "connected") {
      throw new Error("Instance is not connected")
    }

    const message: Message = {
      id: this.generateMessageId(),
      instanceId,
      type: "text",
      from: instance.phoneNumber,
      to: request.chatId,
      body: request.message,
      timestamp: new Date(),
      status: "pending",
    }

    storage.addMessage(message)

    // Simulate sending message (replace with actual WhatsApp API call)
    setTimeout(() => {
      storage.updateMessageStatus(message.id, "sent")
      setTimeout(() => {
        storage.updateMessageStatus(message.id, "delivered")
      }, 1000)
    }, 500)

    return message
  }

  async sendFile(instanceId: string, request: SendFileRequest): Promise<Message> {
    const instance = storage.getInstance(instanceId)
    if (!instance) {
      throw new Error("Instance not found")
    }

    if (instance.status !== "connected") {
      throw new Error("Instance is not connected")
    }

    const message: Message = {
      id: this.generateMessageId(),
      instanceId,
      type: this.getFileType(request.fileName),
      from: instance.phoneNumber,
      to: request.chatId,
      body: request.caption,
      mediaUrl: request.urlFile,
      timestamp: new Date(),
      status: "pending",
    }

    storage.addMessage(message)

    // Simulate sending file
    setTimeout(() => {
      storage.updateMessageStatus(message.id, "sent")
    }, 1000)

    return message
  }

  async processWebhook(instanceId: string, payload: any): Promise<void> {
    const instance = storage.getInstance(instanceId)
    if (!instance) {
      throw new Error("Instance not found")
    }

    // Process incoming message
    if (payload.type === "message") {
      const message: Message = {
        id: payload.data.messageId || this.generateMessageId(),
        instanceId,
        type: "text",
        from: payload.data.from,
        to: instance.phoneNumber,
        body: payload.data.body,
        mediaUrl: payload.data.mediaUrl,
        timestamp: new Date(payload.data.timestamp),
        status: "delivered",
      }

      storage.addMessage(message)

      // Forward to configured webhook URL if exists
      if (instance.webhookUrl) {
        await this.forwardToWebhook(instance.webhookUrl, payload)
      }
    }
  }

  private async forwardToWebhook(url: string, payload: any): Promise<void> {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Failed to forward webhook:", error)
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getFileType(fileName: string): Message["type"] {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return "image"
    }
    if (["mp4", "avi", "mov"].includes(ext || "")) {
      return "video"
    }
    if (["mp3", "wav", "ogg"].includes(ext || "")) {
      return "audio"
    }
    return "document"
  }
}

export const whatsappService = new WhatsAppService()
