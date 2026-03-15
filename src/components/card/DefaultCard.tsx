import type { Card, CardLink } from "@prisma/client";

type CardWithLinks = Card & { links: CardLink[] };

const platformIcons: Record<string, string> = {
  instagram: "📷",
  linkedin: "💼",
  github: "💻",
  twitter: "🐦",
  youtube: "🎬",
  website: "🌐",
  facebook: "👥",
  tiktok: "🎵",
};

export default function DefaultCard({ card }: { card: CardWithLinks }) {
  const accentColor = card.accentColor || "#0066FF";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* 상단 컬러 바 */}
        <div className="h-2" style={{ backgroundColor: accentColor }} />

        {/* 프로필 영역 */}
        <div className="px-8 pt-8 pb-6 text-center">
          {/* 프로필 사진 */}
          {card.photo ? (
            <img
              src={card.photo}
              alt={card.name}
              className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              {card.name.charAt(0)}
            </div>
          )}

          {/* 이름 */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.name}
          </h1>
          {card.nameEn && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {card.nameEn}
            </p>
          )}

          {/* 직함 / 회사 */}
          {(card.title || card.company) && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {card.title}
              {card.title && card.company && " · "}
              {card.company}
            </p>
          )}

          {/* 소개글 */}
          {card.bio && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">
              {card.bio}
            </p>
          )}
        </div>

        {/* 연락처 영역 */}
        <div className="px-8 pb-4 space-y-3">
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg">📱</span>
              <span className="text-gray-700 dark:text-gray-200">
                {card.phone}
              </span>
            </a>
          )}
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg">✉️</span>
              <span className="text-gray-700 dark:text-gray-200">
                {card.email}
              </span>
            </a>
          )}
        </div>

        {/* SNS 링크 영역 */}
        {card.links.length > 0 && (
          <div className="px-8 pb-6">
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {card.links
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200"
                  >
                    <span>{platformIcons[link.platform] || "🔗"}</span>
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* 연락처 저장 버튼 */}
        <div className="px-8 pb-8">
          <a
            href={`/api/vcard/${card.slug}`}
            className="block w-full text-center py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            연락처 저장
          </a>
        </div>
      </div>
    </div>
  );
}
