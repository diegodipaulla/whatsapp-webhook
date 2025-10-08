import { type NextRequest, NextResponse } from "next/server"
import { whatsappService } from "@/lib/whatsapp-service"
import type { ApiResponse } from "@/types"

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  try {
    const payload = await request.json()

    await whatsappService.processWebhook(params.instanceId, payload)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Webhook processed" },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
