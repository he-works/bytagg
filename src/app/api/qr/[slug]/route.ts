import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const card = await prisma.card.findUnique({
    where: { slug: decodedSlug, isActive: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 현재 요청의 호스트 기반으로 명함 URL 생성
  const host = req.headers.get("host") || "localhost:4000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const cardUrl = `${protocol}://${host}/${card.slug}`;

  const qrBuffer = await QRCode.toBuffer(cardUrl, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return new NextResponse(new Uint8Array(qrBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
