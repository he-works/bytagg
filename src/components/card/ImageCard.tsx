"use client";

import { useState, useRef, useEffect } from "react";
import type { Card, CardLink, CardImage } from "@prisma/client";
import ShareButton from "./ShareButton";

type CardWithLinksAndImages = Card & { links: CardLink[]; images: CardImage[] };

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

export default function ImageCard({ card }: { card: CardWithLinksAndImages }) {
  const accentColor = card.accentColor || "#0066FF";
  const images = card.images?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치에 따라 현재 슬라이드 인디케이터 업데이트
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(index);
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  // 5초 간격 자동 슬라이딩
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % images.length;
        goToSlide(next);
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  // 특정 슬라이드로 스크롤 이동
  function goToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({ left: slideWidth * index, behavior: "smooth" });
  }

  // 이전/다음 슬라이드
  function prevSlide() {
    const prev = currentSlide <= 0 ? images.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    goToSlide(prev);
  }

  function nextSlide() {
    const next = (currentSlide + 1) % images.length;
    setCurrentSlide(next);
    goToSlide(next);
  }

  return (
    <div className="imgcard-page">
      <div className="imgcard-body">
        {/* 히어로 이미지 캐러셀 */}
        {images.length > 0 ? (
          <div className="imgcard-hero">
            <div ref={carouselRef} className="imgcard-carousel">
              {images.map((img) => (
                <div key={img.id} className="imgcard-slide">
                  <div className="imgcard-slide-inner">
                    <img
                      src={img.url}
                      alt={card.name}
                      className="imgcard-slide-img"
                    />
                    {/* 그라데이션 오버레이 */}
                    <div className="imgcard-overlay" />
                  </div>
                </div>
              ))}
            </div>

            {/* 오버레이 텍스트: 이름, 직함/회사 */}
            <div className="imgcard-hero-text">
              <h1 className="imgcard-hero-name">{card.name}</h1>
              {card.nameEn && (
                <p className="imgcard-hero-name-en">{card.nameEn}</p>
              )}
              {(card.title || card.company) && (
                <p className="imgcard-hero-title">
                  {card.title}
                  {card.title && card.company && " · "}
                  {card.company}
                </p>
              )}
              {(card.titleEn || card.companyEn) && (
                <p className="imgcard-hero-title-en">
                  {card.titleEn}
                  {card.titleEn && card.companyEn && " · "}
                  {card.companyEn}
                </p>
              )}
            </div>

            {/* 슬라이드 인디케이터 + 좌우 화살표 */}
            {images.length > 1 && (
              <>
                {/* 인디케이터 점 */}
                <div className="imgcard-indicators">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentSlide(i); goToSlide(i); }}
                      className={`imgcard-dot${i === currentSlide ? " is-active" : ""}`}
                    />
                  ))}
                </div>

                {/* 우측 하단 좌우 화살표 */}
                <div className="imgcard-arrows">
                  <button
                    onClick={prevSlide}
                    className="imgcard-arrow"
                    aria-label="이전 사진"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="imgcard-arrow"
                    aria-label="다음 사진"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* 이미지가 없을 경우 프로필 사진 또는 이니셜 표시 */
          <div className="imgcard-fallback" style={{ backgroundColor: accentColor }}>
            {card.photo ? (
              <img src={card.photo} alt={card.name} />
            ) : (
              <span className="imgcard-fallback-initial">
                {card.name.charAt(0)}
              </span>
            )}
          </div>
        )}

        {/* 하단 정보 영역 */}
        <div className="imgcard-info">
          {/* 소개글 */}
          {card.bio && (
            <p className="imgcard-bio">{card.bio}</p>
          )}

          {/* 연락처 */}
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

          {/* SNS 링크 */}
          {card.links.length > 0 && (
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
          )}

          {/* 연락처 저장 + 공유 */}
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
