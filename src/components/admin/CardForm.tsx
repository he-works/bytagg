"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DefaultCard from "@/components/card/DefaultCard";
import type { Card, CardLink } from "@prisma/client";

type LinkInput = { platform: string; url: string };

type CardFormProps = {
  initialData?: Card & { links: CardLink[] };
};

const PLATFORMS = [
  "website", "instagram", "linkedin", "github", "twitter",
  "youtube", "facebook", "tiktok",
];

export default function CardForm({ initialData }: CardFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    name: initialData?.name || "",
    nameEn: initialData?.nameEn || "",
    title: initialData?.title || "",
    company: initialData?.company || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    bio: initialData?.bio || "",
    accentColor: initialData?.accentColor || "#0066FF",
    isActive: initialData?.isActive ?? true,
  });

  const [links, setLinks] = useState<LinkInput[]>(
    initialData?.links?.map((l) => ({ platform: l.platform, url: l.url })) || []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addLink() {
    setLinks([...links, { platform: "website", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof LinkInput, value: string) {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  }

  // 미리보기용 가짜 Card 객체
  const previewCard = {
    id: 0,
    slug: form.slug,
    name: form.name || "이름",
    nameEn: form.nameEn || null,
    title: form.title || null,
    company: form.company || null,
    phone: form.phone || null,
    email: form.email || null,
    photo: null,
    bio: form.bio || null,
    template: "default",
    theme: "light",
    accentColor: form.accentColor,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    links: links
      .filter((l) => l.url)
      .map((l, i) => ({ id: i, cardId: 0, platform: l.platform, url: l.url, sortOrder: i })),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      nameEn: form.nameEn || null,
      title: form.title || null,
      company: form.company || null,
      phone: form.phone || null,
      email: form.email || null,
      bio: form.bio || null,
      links: links.filter((l) => l.url),
    };

    const url = isEditing ? `/api/cards/${initialData.id}` : "/api/cards";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/cards");
    } else {
      const data = await res.json();
      setError(data.error || "저장에 실패했습니다");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          {isEditing ? "명함 수정" : "새 명함 만들기"}
        </h1>
        <button
          onClick={() => router.push("/admin/cards")}
          className="text-gray-500 hover:text-gray-700"
        >
          목록으로
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">기본 정보</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL 슬러그 *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="hong-gildong"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (한글) *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="홍길동"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (영문)
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => updateField("nameEn", e.target.value)}
                  placeholder="Gildong Hong"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직함</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="소프트웨어 엔지니어"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회사</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="테크컴퍼니"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소개글</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="간단한 자기소개를 작성해주세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강조색</label>
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
              </div>
              <label className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">활성화</span>
              </label>
            </div>
          </div>

          {/* SNS 링크 */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">SNS 링크</h2>
              <button
                type="button"
                onClick={addLink}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                + 링크 추가
              </button>
            </div>

            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(i, "platform", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : isEditing ? "수정 저장" : "명함 생성"}
          </button>
        </form>

        {/* 실시간 미리보기 */}
        <div className="hidden lg:block">
          <h2 className="font-bold text-lg mb-4">미리보기</h2>
          <div className="sticky top-6 transform scale-[0.85] origin-top">
            <DefaultCard card={previewCard} />
          </div>
        </div>
      </div>
    </div>
  );
}
