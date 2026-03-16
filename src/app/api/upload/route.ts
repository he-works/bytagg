import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 업로드 타입 확인: gallery(갤러리 이미지) 또는 photo(프로필 사진)
  const { searchParams } = new URL(req.url);
  const uploadType = searchParams.get("type") || "photo";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }

  // 이미지 파일만 허용
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 });
  }

  // 파일 크기 제한: gallery는 2MB, photo는 5MB
  const maxSize = uploadType === "gallery" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
  const maxSizeLabel = uploadType === "gallery" ? "2MB" : "5MB";
  if (file.size > maxSize) {
    return NextResponse.json({ error: `파일 크기는 ${maxSizeLabel} 이하만 가능합니다` }, { status: 400 });
  }

  // 고유한 파일명 생성 (타입별 경로 분리)
  const ext = file.name.split(".").pop() || "jpg";
  const folder = uploadType === "gallery" ? "gallery" : "photos";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Vercel Blob Storage에 업로드
  const blob = await put(fileName, file, {
    access: "public",
    allowOverwrite: true,
  });

  return NextResponse.json({ url: blob.url });
}
