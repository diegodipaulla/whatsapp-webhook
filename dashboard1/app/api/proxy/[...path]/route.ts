import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api"

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/proxy/", "")

  try {
    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch from backend" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/proxy/", "")
  const body = await request.json()

  try {
    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json({ error: "Failed to post to backend" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/proxy/", "")

  try {
    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json({ error: "Failed to delete from backend" }, { status: 500 })
  }
}
