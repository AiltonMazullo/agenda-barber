import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const upstream = `${API_BASE}/uploads/${path.join("/")}`;

  const res = await fetch(upstream, { cache: "force-cache" });

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const body = await res.arrayBuffer();
  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
