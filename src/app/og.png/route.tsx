import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/profile";

/** og:image. 정적 export에서도 확장자가 붙은 파일로 나오도록 route handler로 생성 */
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), "node_modules/pretendard/dist/public/static");

export async function GET() {
  const [bold, semibold] = await Promise.all([
    readFile(join(fontDir, "Pretendard-Bold.otf")),
    readFile(join(fontDir, "Pretendard-SemiBold.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#FFFFFF",
          backgroundImage: "radial-gradient(circle at 1px 1px, #C8D4DD 1.5px, transparent 0)",
          backgroundSize: "28px 28px",
          color: "#16324B",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 600 }}>
          <div style={{ width: 28, height: 28, border: "4px solid #006D75", borderRadius: 4, background: "#E4F2F1" }} />
          {site.name}
          <span style={{ color: "#006D75", fontSize: 26 }}>Frontend Engineer</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.15, letterSpacing: -2 }}>
          <span>빨리 만들고,</span>
          <span>오래 버티게 만듭니다</span>
        </div>
        <div style={{ display: "flex", gap: 40, fontSize: 28, fontWeight: 600, color: "#465B6B" }}>
          <span>render 2,340 → 1</span>
          <span>CLS 0.168 → 0.003</span>
          <span style={{ marginLeft: "auto", color: "#006D75" }}>reeny404.github.io</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: bold, weight: 700, style: "normal" },
        { name: "Pretendard", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
