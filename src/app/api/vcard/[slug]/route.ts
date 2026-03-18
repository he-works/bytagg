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

  // 전화번호에 국제번호 붙이기 (하이픈 제거 후 국제 형식으로)
  let telValue = "";
  if (card.phone) {
    const digits = card.phone.replace(/[^0-9]/g, "");
    // 0으로 시작하면 0 제거 후 국제번호 붙이기
    const international = digits.startsWith("0")
      ? card.countryCode + digits.slice(1)
      : card.countryCode + digits;
    telValue = international;
  }

  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name}`,
    card.nameEn ? `FN;CHARSET=UTF-8:${card.nameEn}` : "",
    card.company ? `ORG:${card.company}` : "",
    card.title ? `TITLE:${card.title}` : "",
    telValue ? `TEL;TYPE=CELL:${telValue}` : "",
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
