"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DefaultCard from "@/components/card/DefaultCard";
import ImageCard from "@/components/card/ImageCard";
import type { Card, CardLink, CardImage } from "@prisma/client";

type LinkInput = { platform: string; url: string };

type CardFormProps = {
  initialData?: Card & { links: CardLink[]; images?: CardImage[] };
};

const PLATFORMS = [
  "website", "instagram", "linkedin", "github", "twitter",
  "youtube", "facebook", "tiktok",
];

const PLATFORM_PREFIXES: Record<string, string> = {
  website: "https://",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/in/",
  github: "https://github.com/",
  twitter: "https://x.com/",
  youtube: "https://youtube.com/@",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/@",
};

export default function CardForm({ initialData }: CardFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // template: 기존 "default" 값을 "text"로 변환
  const initialTemplate = initialData?.template === "default" ? "text" : (initialData?.template || "text");

  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    name: initialData?.name || "",
    nameEn: initialData?.nameEn || "",
    title: initialData?.title || "",
    company: initialData?.company || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    bio: initialData?.bio || "",
    template: initialTemplate,
    accentColor: initialData?.accentColor || "#0066FF",
    isActive: initialData?.isActive ?? true,
  });

  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 갤러리 이미지 (이미지형 명함용)
  const [galleryImages, setGalleryImages] = useState<{ url: string; sortOrder: number }[]>(
    initialData?.images?.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) || []
  );
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [links, setLinks] = useState<LinkInput[]>(
    initialData?.links?.map((l) => ({ platform: l.platform, url: l.url })) || []
  );

  // 슬러그를 사용자가 직접 수정했는지 추적
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // 영문 이름 → 슬러그 자동 생성 (예: "Gildong Hong" → "gildong-hong")
  function generateSlug(nameEn: string): string {
    return nameEn
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")  // 영문, 숫자, 공백, 하이픈만 남김
      .replace(/\s+/g, "-")           // 공백 → 하이픈
      .replace(/-+/g, "-")            // 연속 하이픈 제거
      .replace(/^-|-$/g, "");         // 앞뒤 하이픈 제거
  }

  function handleNameEnChange(value: string) {
    updateField("nameEn", value);
    // 사용자가 슬러그를 직접 수정하지 않았으면 자동 생성
    if (!slugManuallyEdited) {
      updateField("slug", generateSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    updateField("slug", value);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhoto(data.url);
      } else {
        const data = await res.json();
        setError(data.error || "사진 업로드에 실패했습니다");
      }
    } catch {
      setError("사진 업로드 중 오류가 발생했습니다");
    }
    setUploading(false);
  }

  // 갤러리 이미지 업로드 (다중 파일 지원)
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 5 - galleryImages.length;
    if (remaining <= 0) {
      setError("갤러리 이미지는 최대 5장까지 가능합니다");
      return;
    }

    // 선택한 파일 수가 남은 슬롯보다 많으면 경고
    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(`남은 슬롯이 ${remaining}장이므로 ${filesToUpload.length}장만 업로드합니다`);
    } else {
      setError("");
    }

    setGalleryUploading(true);

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload?type=gallery", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setGalleryImages((prev) => [...prev, { url: data.url, sortOrder: prev.length }]);
        } else {
          const data = await res.json();
          setError(data.error || `"${file.name}" 업로드에 실패했습니다`);
        }
      } catch {
        setError(`"${file.name}" 업로드 중 오류가 발생했습니다`);
      }
    }

    setGalleryUploading(false);
    // 같은 파일 재업로드 허용
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function removeGalleryImage(index: number) {
    setGalleryImages((prev) =>
      prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i }))
    );
  }

  // 드래그 앤 드롭으로 갤러리 이미지 순서 변경
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      setGalleryImages((prev) => {
        const updated = [...prev];
        const [dragged] = updated.splice(dragIndex, 1);
        updated.splice(dragOverIndex, 0, dragged);
        return updated.map((img, i) => ({ ...img, sortOrder: i }));
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function addLink() {
    setLinks([...links, { platform: "website", url: PLATFORM_PREFIXES["website"] }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof LinkInput, value: string) {
    const updated = [...links];
    if (field === "platform") {
      const oldPrefix = PLATFORM_PREFIXES[updated[index].platform] || "";
      const newPrefix = PLATFORM_PREFIXES[value] || "";
      const currentUrl = updated[index].url;
      // 기존 프리픽스만 있거나 비어있으면 새 프리픽스로 교체
      if (!currentUrl || currentUrl === oldPrefix) {
        updated[index] = { platform: value, url: newPrefix };
      } else if (currentUrl.startsWith(oldPrefix)) {
        // 기존 프리픽스 뒤에 사용자 입력이 있으면 프리픽스만 교체
        updated[index] = { platform: value, url: newPrefix + currentUrl.slice(oldPrefix.length) };
      } else {
        updated[index] = { ...updated[index], platform: value };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
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
    photo: photo,
    bio: form.bio || null,
    template: form.template,
    theme: "light",
    accentColor: form.accentColor,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    links: links
      .filter((l) => l.url)
      .map((l, i) => ({ id: i, cardId: 0, platform: l.platform, url: l.url, sortOrder: i })),
    images: galleryImages.map((img, i) => ({ id: i, cardId: 0, url: img.url, sortOrder: img.sortOrder })),
  };

  function handleReset() {
    setForm({
      slug: initialData?.slug || "",
      name: initialData?.name || "",
      nameEn: initialData?.nameEn || "",
      title: initialData?.title || "",
      company: initialData?.company || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      bio: initialData?.bio || "",
      template: initialTemplate,
      accentColor: initialData?.accentColor || "#0066FF",
      isActive: initialData?.isActive ?? true,
    });
    setPhoto(initialData?.photo || null);
    setLinks(
      initialData?.links?.map((l) => ({ platform: l.platform, url: l.url })) || []
    );
    setGalleryImages(
      initialData?.images?.map((img) => ({ url: img.url, sortOrder: img.sortOrder })) || []
    );
    setSlugManuallyEdited(!!initialData?.slug);
    setError("");
  }

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
      photo: photo,
      links: links.filter((l) => l.url),
      images: galleryImages,
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
          {/* 템플릿 선택 */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">명함 타입</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateField("template", "text")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.template === "text"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium">텍스트형</div>
                <div className="text-xs mt-1 text-gray-500">프로필 사진 + 텍스트 중심</div>
              </button>
              <button
                type="button"
                onClick={() => updateField("template", "image")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.template === "image"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <div className="font-medium">이미지형</div>
                <div className="text-xs mt-1 text-gray-500">대형 사진 캐러셀 + 오버레이</div>
              </button>
            </div>
          </div>

          {/* 갤러리 이미지 (이미지형 선택 시만 표시) */}
          {form.template === "image" && (
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">갤러리 이미지</h2>
                <span className="text-sm text-gray-500">{galleryImages.length}/5장</span>
              </div>
              <p className="text-xs text-gray-400">최대 5장, 각 2MB 이하. 큰 사진을 올려주세요.</p>

              {/* 업로드된 이미지 미리보기 (드래그로 순서 변경 가능) */}
              {galleryImages.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">이미지를 드래그하여 순서를 변경할 수 있습니다</p>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.map((img, i) => (
                      <div
                        key={`${img.url}-${i}`}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                          dragIndex === i ? "opacity-40 scale-95" : ""
                        } ${dragOverIndex === i && dragIndex !== i ? "ring-2 ring-blue-400 ring-offset-2 rounded-lg" : ""}`}
                      >
                        <img
                          src={img.url}
                          alt={`갤러리 ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 이미지 추가 버튼 */}
              {galleryImages.length < 5 && (
                <div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    {galleryUploading ? "업로드 중..." : "+ 이미지 추가"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 기본 정보 (이름, 연락처 등) */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">기본 정보</h2>

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
                  onChange={(e) => handleNameEnChange(e.target.value)}
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
          </div>

          {/* 카드 설정 (슬러그, 사진, 강조색) */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-lg">카드 설정</h2>

            {/* URL 슬러그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL 슬러그 *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="hong-gildong"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                영문 이름 입력 시 자동 생성됩니다. 직접 수정도 가능합니다.
              </p>
            </div>

            {/* 프로필 사진 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">프로필 사진</label>
              <div className="flex items-center gap-4">
                {photo ? (
                  <img
                    src={photo}
                    alt="프로필"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: form.accentColor }}
                  >
                    {form.name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {uploading ? "업로드 중..." : photo ? "사진 변경" : "사진 선택"}
                  </button>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="px-4 py-2 text-sm text-red-500 hover:text-red-700"
                    >
                      사진 삭제
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 강조색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">강조색</label>
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => updateField("accentColor", e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
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
            type="button"
            onClick={() => updateField("isActive", !form.isActive)}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              form.isActive
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {form.isActive ? "명함 비활성화하기" : "명함 활성화하기"}
          </button>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "저장 중..." : isEditing ? "수정 저장" : "명함 생성"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </form>

        {/* 실시간 미리보기 */}
        <div className="hidden lg:block">
          <h2 className="font-bold text-lg mb-4">미리보기</h2>
          <div className="sticky top-6 transform scale-[0.85] origin-top">
            {form.template === "image" && galleryImages.length > 0 ? (
              <ImageCard card={previewCard} />
            ) : (
              <DefaultCard card={previewCard} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
