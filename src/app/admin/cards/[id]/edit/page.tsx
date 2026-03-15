"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CardForm from "@/components/admin/CardForm";
import type { Card, CardLink } from "@prisma/client";

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<(Card & { links: CardLink[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards/${params.id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return null;
        }
        if (!res.ok) {
          router.push("/admin/cards");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setCard(data);
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">불러오는 중...</div>;
  }

  if (!card) {
    return <div className="p-8 text-center text-gray-500">명함을 찾을 수 없습니다.</div>;
  }

  return <CardForm initialData={card} />;
}
