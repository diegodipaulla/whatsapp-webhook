import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { authenticateRequest } from "@/lib/auth"
import type { ApiResponse } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const instance = storage.getInstance(params.instanceId)

  if (!instance) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Instance not found" }, { status: 404 })
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      instanceId: instance.id,
      status: instance.status,
      phoneNumber: instance.phoneNumber,
    },
  })
}

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!["connected", "disconnected", "connecting"].includes(status)) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Invalid status" }, { status: 400 })
    }

    const updated = storage.updateInstance(params.instanceId, { status })

    if (!updated) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Instance not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { status: updated.status },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Failed to update status" }, { status: 500 })
  }
}
