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
  const { links, images, ...cardData } = data;

  const cardId = parseInt(id);

  // 기존 링크 & 이미지 삭제 후 새로 생성
  await prisma.cardLink.deleteMany({ where: { cardId } });
  await prisma.cardImage.deleteMany({ where: { cardId } });

  const card = await prisma.card.update({
    where: { id: cardId },
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
    include: { links: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}
