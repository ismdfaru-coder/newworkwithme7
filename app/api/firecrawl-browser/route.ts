import { NextRequest, NextResponse } from "next/server"

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "fc-21c577cb2e1a48d1a850e2850aceb4b4"
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v2/browser"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, code, language, url } = body

    // Launch a new browser session
    if (action === "launch") {
      const response = await fetch(FIRECRAWL_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ttl: 300, // 5 minutes
          activityTtl: 120, // 2 minutes inactivity timeout
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || "Failed to launch browser session" },
          { status: response.status }
        )
      }

      return NextResponse.json({
        success: true,
        sessionId: data.id,
        cdpUrl: data.cdpUrl,
        liveViewUrl: data.liveViewUrl,
        interactiveLiveViewUrl: data.interactiveLiveViewUrl,
      })
    }

    // Execute code in browser session
    if (action === "execute") {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Session ID is required" },
          { status: 400 }
        )
      }

      // If URL is provided, construct navigation code
      let executeCode = code
      if (url && !code) {
        executeCode = `await page.goto("${url}"); const title = await page.title(); console.log(title);`
      }

      const response = await fetch(`${FIRECRAWL_API_URL}/${sessionId}/execute`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: executeCode,
          language: language || "node",
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || "Failed to execute code" },
          { status: response.status }
        )
      }

      return NextResponse.json({
        success: true,
        result: data.result,
      })
    }

    // Navigate to URL
    if (action === "navigate") {
      if (!sessionId || !url) {
        return NextResponse.json(
          { error: "Session ID and URL are required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${FIRECRAWL_API_URL}/${sessionId}/execute`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: `await page.goto("${url}"); const title = await page.title(); console.log(title);`,
          language: "node",
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || "Failed to navigate" },
          { status: response.status }
        )
      }

      return NextResponse.json({
        success: true,
        result: data.result,
      })
    }

    // Get screenshot / snapshot
    if (action === "snapshot") {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Session ID is required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${FIRECRAWL_API_URL}/${sessionId}/execute`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "agent-browser snapshot",
          language: "bash",
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || "Failed to take snapshot" },
          { status: response.status }
        )
      }

      return NextResponse.json({
        success: true,
        result: data.result,
      })
    }

    // Close browser session
    if (action === "close") {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Session ID is required" },
          { status: 400 }
        )
      }

      const response = await fetch(`${FIRECRAWL_API_URL}/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return NextResponse.json(
          { error: data.error || "Failed to close browser session" },
          { status: response.status }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Firecrawl browser error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
