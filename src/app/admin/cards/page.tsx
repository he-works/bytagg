"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Card = {
  id: number;
  slug: string;
  name: string;
  title: string | null;
  company: string | null;
  isActive: boolean;
  _count: { views: number };
};

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin");
          return [];
        }
        return res.json();
      })
      .then(setCards)
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 명함을 삭제하시겠습니까?`)) return;

    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    setCards(cards.filter((c) => c.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">불러오는 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">명함 관리</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/cards/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            + 새 명함
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 명함 목록 */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
          아직 명함이 없습니다. 새 명함을 만들어보세요.
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl shadow p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">{card.name}</h2>
                  {!card.isActive && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      비활성
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  {[card.title, card.company].filter(Boolean).join(" · ") || "정보 없음"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>/{card.slug}</span>
                  <span>조회 {card._count.views}회</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/${card.slug}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm px-3 py-2"
                >
                  보기
                </a>
                <a
                  href={`/api/qr/${card.slug}`}
                  target="_blank"
                  className="text-green-600 hover:text-green-800 text-sm px-3 py-2"
                >
                  QR
                </a>
                <Link
                  href={`/admin/cards/${card.id}/edit`}
                  className="text-gray-600 hover:text-gray-800 text-sm px-3 py-2"
                >
                  수정
                </Link>
                <button
                  onClick={() => handleDelete(card.id, card.name)}
                  className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
