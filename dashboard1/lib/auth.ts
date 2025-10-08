import { storage } from "./storage"
import type { NextRequest } from "next/server"

export function authenticateRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const instance = storage.getInstanceByToken(token)

  return instance ? instance.id : null
}

export function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
}

export function generateInstanceId(): string {
  return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
