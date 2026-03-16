import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// 명함 목록 조회
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    include: { links: true, images: { orderBy: { sortOrder: "asc" } }, _count: { select: { views: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

// 명함 생성
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { links, images, ...cardData } = data;

  const card = await prisma.card.create({
    data: {
      ...cardData,
      links: links?.length
        ? { create: links.map((l: { platform: string; url: string }, i: number) => ({ ...l, sortOrder: i })) }
        : undefined,
      images: images?.length
        ? { create: images.map((img: { url: string; sortOrder: number }) => ({ url: img.url, sortOrder: img.sortOrder })) }
        : undefined,
    },
    include: { links: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(card, { status: 201 });
}
