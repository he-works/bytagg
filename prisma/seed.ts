import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const card1 = await prisma.card.upsert({
    where: { slug: "hong-gildong" },
    update: {},
    create: {
      slug: "hong-gildong",
      name: "홍길동",
      nameEn: "Gildong Hong",
      title: "소프트웨어 엔지니어",
      company: "테크컴퍼니",
      phone: "010-1234-5678",
      email: "gildong@example.com",
      bio: "풀스택 개발자로 5년째 웹 서비스를 만들고 있습니다. 새로운 기술에 관심이 많습니다.",
      template: "default",
      theme: "light",
      accentColor: "#0066FF",
      links: {
        create: [
          { platform: "github", url: "https://github.com/gildong", sortOrder: 0 },
          { platform: "linkedin", url: "https://linkedin.com/in/gildong", sortOrder: 1 },
          { platform: "instagram", url: "https://instagram.com/gildong", sortOrder: 2 },
        ],
      },
    },
  });

  const card2 = await prisma.card.upsert({
    where: { slug: "kim-younghee" },
    update: {},
    create: {
      slug: "kim-younghee",
      name: "김영희",
      nameEn: "Younghee Kim",
      title: "UX 디자이너",
      company: "디자인스튜디오",
      phone: "010-9876-5432",
      email: "younghee@example.com",
      bio: "사용자 중심의 디자인을 추구합니다. 심플하면서도 직관적인 경험을 만들어갑니다.",
      template: "default",
      theme: "light",
      accentColor: "#E91E63",
      links: {
        create: [
          { platform: "website", url: "https://younghee.design", sortOrder: 0 },
          { platform: "instagram", url: "https://instagram.com/younghee_design", sortOrder: 1 },
        ],
      },
    },
  });

  console.log("시드 데이터 생성 완료:", { card1: card1.slug, card2: card2.slug });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
