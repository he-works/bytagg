import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

// 명함 수정
export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  const { links, ...cardData } = data;

  // 기존 링크 삭제 후 새로 생성
  await prisma.cardLink.deleteMany({ where: { cardId: parseInt(id) } });

  const card = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      ...cardData,
      links: links?.length
        ? { create: links.map((l: { platform: string; url: string }, i: number) => ({ ...l, sortOrder: i })) }
        : undefined,
    },
    include: { links: true },
  });

  return NextResponse.json(card);
}

// 명함 삭제
export async function DELETE(_req: NextRequest, { params }: Props) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.card.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ success: true });
}

// 명함 단건 조회
export async function GET(_req: NextRequest, { params }: Props) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: parseInt(id) },
    include: { links: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}
