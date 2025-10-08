import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateToken, generateInstanceId } from "@/lib/auth"
import type { Instance, ApiResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, webhookUrl } = body

    if (!phoneNumber) {
      return NextResponse.json<ApiResponse>({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    const instance: Instance = {
      id: generateInstanceId(),
      token: generateToken(),
      webhookUrl: webhookUrl || "",
      phoneNumber,
      status: "disconnected",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    storage.createInstance(instance)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        instanceId: instance.id,
        token: instance.token,
        phoneNumber: instance.phoneNumber,
        webhookUrl: instance.webhookUrl,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Failed to create instance" }, { status: 500 })
  }
}
