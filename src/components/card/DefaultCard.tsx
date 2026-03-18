import type { Card, CardLink } from "@prisma/client";
import ShareButton from "./ShareButton";

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
    <div className="card-page">
      <div className="card-body">
        {/* 상단 컬러 바 */}
        <div className="card-accent-bar" style={{ backgroundColor: accentColor }} />

        {/* 프로필 영역 */}
        <div className="card-profile">
          {/* 프로필 사진 */}
          {card.photo ? (
            <img
              src={card.photo}
              alt={card.name}
              className="card-photo"
            />
          ) : (
            <div
              className="card-initial"
              style={{ backgroundColor: accentColor }}
            >
              {card.name.charAt(0)}
            </div>
          )}

          {/* 이름 */}
          <h1 className="card-name">{card.name}</h1>
          {card.nameEn && (
            <p className="card-name-en">{card.nameEn}</p>
          )}

          {/* 직함 / 회사 */}
          {(card.title || card.company) && (
            <p className="card-title">
              {card.title}
              {card.title && card.company && " · "}
              {card.company}
            </p>
          )}
          {(card.titleEn || card.companyEn) && (
            <p className="card-title-en">
              {card.titleEn}
              {card.titleEn && card.companyEn && " · "}
              {card.companyEn}
            </p>
          )}

          {/* 소개글 */}
          {card.bio && (
            <p className="card-bio">{card.bio}</p>
          )}
        </div>

        {/* 연락처 영역 */}
        <div className="card-section">
          <div className="card-contacts">
            {card.phone && (
              <a href={`tel:${card.phone}`} className="card-contact">
                <span className="card-contact-icon">📱</span>
                <span className="card-contact-text">{card.phone}</span>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} className="card-contact">
                <span className="card-contact-icon">✉️</span>
                <span className="card-contact-text">{card.email}</span>
              </a>
            )}
          </div>
        </div>

        {/* SNS 링크 영역 */}
        {card.links.length > 0 && (
          <div className="card-section--sns">
            <div className="card-sns-list">
              {card.links
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-sns-link"
                  >
                    <span>{platformIcons[link.platform] || "🔗"}</span>
                    <span className="card-sns-name">{link.platform}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* 연락처 저장 + 공유 버튼 */}
        <div className="card-section--actions">
          <div className="card-actions">
            <a
              href={`/api/vcard/${card.slug}`}
              className="card-save-btn"
              style={{ backgroundColor: accentColor }}
            >
              연락처 저장
            </a>
            <ShareButton name={card.name} slug={card.slug} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
