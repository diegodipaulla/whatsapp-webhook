import { type NextRequest, NextResponse } from "next/server"
import { whatsappService } from "@/lib/whatsapp-service"
import { authenticateRequest } from "@/lib/auth"
import type { ApiResponse, SendMessageRequest } from "@/types"

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: SendMessageRequest = await request.json()

    if (!body.chatId || !body.message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "chatId and message are required" },
        { status: 400 },
      )
    }

    const message = await whatsappService.sendMessage(params.instanceId, body)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        messageId: message.id,
        status: message.status,
        timestamp: message.timestamp,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
