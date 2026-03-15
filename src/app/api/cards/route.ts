import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// 명함 목록 조회
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    include: { links: true, _count: { select: { views: true } } },
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
  const { links, ...cardData } = data;

  const card = await prisma.card.create({
    data: {
      ...cardData,
      links: links?.length
        ? { create: links.map((l: { platform: string; url: string }, i: number) => ({ ...l, sortOrder: i })) }
        : undefined,
    },
    include: { links: true },
  });

  return NextResponse.json(card, { status: 201 });
}
