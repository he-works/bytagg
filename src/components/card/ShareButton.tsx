"use client";

import { useState } from "react";

type ShareButtonProps = {
  name: string;
  slug: string;
  accentColor?: string;
};

export default function ShareButton({ name, slug, accentColor = "#0066FF" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const cardUrl = typeof window !== "undefined" ? `${window.location.origin}/${slug}` : `/${slug}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}의 명함`,
          text: `${name}의 디지털 명함을 확인해보세요!`,
          url: cardUrl,
        });
      } catch {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = cardUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="card-share">
      {/* 링크 복사 버튼 */}
      <button
        onClick={handleCopy}
        className="card-share-copy"
        style={{
          borderColor: accentColor,
          color: copied ? "#fff" : accentColor,
          backgroundColor: copied ? accentColor : "transparent",
        }}
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            복사됨!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            링크 복사
          </>
        )}
      </button>

      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        className="card-share-native"
        style={{ backgroundColor: accentColor }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        공유하기
      </button>
    </div>
  );
}
