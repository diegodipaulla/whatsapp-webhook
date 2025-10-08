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
      phoneNumber: instance.phoneNumber,
      webhookUrl: instance.webhookUrl,
      status: instance.status,
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { webhookUrl, phoneNumber } = body

    const updated = storage.updateInstance(params.instanceId, {
      webhookUrl,
      phoneNumber,
    })

    if (!updated) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Instance not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        instanceId: updated.id,
        phoneNumber: updated.phoneNumber,
        webhookUrl: updated.webhookUrl,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
