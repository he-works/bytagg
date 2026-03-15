import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import DefaultCard from "@/components/card/DefaultCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const card = await prisma.card.findUnique({
    where: { slug: decodedSlug, isActive: true },
    include: { links: true },
  });

  if (!card) {
    notFound();
  }

  // 조회수 기록
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "";

  await prisma.cardView.create({
    data: {
      cardId: card.id,
      ipAddress: ip,
      userAgent: userAgent,
    },
  });

  return <DefaultCard card={card} />;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const card = await prisma.card.findUnique({
    where: { slug: decodedSlug },
  });

  if (!card) return { title: "명함을 찾을 수 없습니다" };

  return {
    title: `${card.name} - 온라인 명함`,
    description: card.bio || `${card.name}${card.title ? ` | ${card.title}` : ""}${card.company ? ` @ ${card.company}` : ""}`,
    openGraph: {
      title: card.name,
      description: card.bio || `${card.name}의 온라인 명함`,
      type: "profile",
    },
  };
}
