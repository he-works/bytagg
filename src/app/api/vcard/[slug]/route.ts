import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, { params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const card = await prisma.card.findUnique({
    where: { slug: decodedSlug, isActive: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name}`,
    card.nameEn ? `FN;CHARSET=UTF-8:${card.nameEn}` : "",
    card.company ? `ORG:${card.company}` : "",
    card.title ? `TITLE:${card.title}` : "",
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.bio ? `NOTE:${card.bio}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.slug}.vcf"`,
    },
  });
}
