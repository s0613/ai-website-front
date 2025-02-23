import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    // 예: Next.js 프로젝트 기준 root/public/uploads/ai-videos
    const folderPath = path.join(process.cwd(), "public", "uploads", "ai-videos");

    // 폴더가 없는 경우 생성
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    return NextResponse.json({ message: "폴더 생성 완료" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "폴더 생성 실패"},
      { status: 500 }
    );
  }
}