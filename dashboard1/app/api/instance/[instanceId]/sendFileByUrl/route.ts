import { type NextRequest, NextResponse } from "next/server"
import { whatsappService } from "@/lib/whatsapp-service"
import { authenticateRequest } from "@/lib/auth"
import type { ApiResponse, SendFileRequest } from "@/types"

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const instanceId = authenticateRequest(request)

  if (!instanceId || instanceId !== params.instanceId) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: SendFileRequest = await request.json()

    if (!body.chatId || !body.urlFile || !body.fileName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "chatId, urlFile, and fileName are required" },
        { status: 400 },
      )
    }

    const message = await whatsappService.sendFile(params.instanceId, body)

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
