import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { authenticateRequest } from "@/lib/auth"
import type { ApiResponse } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "100")

  const messages = storage.getMessages(params.instanceId, limit)

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { messages },
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  storage.clearMessages(params.instanceId)

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { message: "Messages cleared" },
  })
}
