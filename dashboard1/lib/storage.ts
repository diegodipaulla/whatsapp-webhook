import type { Instance, Message } from "@/types"

// In-memory storage (replace with database in production)
class Storage {
  private instances: Map<string, Instance> = new Map()
  private messages: Map<string, Message[]> = new Map()

  // Instance methods
  createInstance(instance: Instance): Instance {
    this.instances.set(instance.id, instance)
    this.messages.set(instance.id, [])
    return instance
  }

  getInstance(id: string): Instance | undefined {
    return this.instances.get(id)
  }

  getInstanceByToken(token: string): Instance | undefined {
    return Array.from(this.instances.values()).find((instance) => instance.token === token)
  }

  updateInstance(id: string, updates: Partial<Instance>): Instance | undefined {
    const instance = this.instances.get(id)
    if (!instance) return undefined

    const updated = { ...instance, ...updates, updatedAt: new Date() }
    this.instances.set(id, updated)
    return updated
  }

  deleteInstance(id: string): boolean {
    this.messages.delete(id)
    return this.instances.delete(id)
  }

  getAllInstances(): Instance[] {
    return Array.from(this.instances.values())
  }

  // Message methods
  addMessage(message: Message): Message {
    const messages = this.messages.get(message.instanceId) || []
    messages.push(message)
    this.messages.set(message.instanceId, messages)
    return message
  }

  getMessages(instanceId: string, limit = 100): Message[] {
    const messages = this.messages.get(instanceId) || []
    return messages.slice(-limit)
  }

  updateMessageStatus(messageId: string, status: Message["status"]): Message | undefined {
    for (const [instanceId, messages] of this.messages.entries()) {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        message.status = status
        return message
      }
    }
    return undefined
  }

  clearMessages(instanceId: string): void {
    this.messages.set(instanceId, [])
  }
}

export const storage = new Storage()
