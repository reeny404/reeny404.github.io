// 사이트에 실제로 쓰인 글자만 남긴 Pretendard Variable을 만든다.
// 92개 unicode-range 조각(페이지당 ~420KB) 대신 파일 하나를 preload하기 위함.
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import subsetFont from "subset-font";

const root = new URL("..", import.meta.url).pathname;
const SOURCES = ["src", "public/llms.txt"];
const EXT = new Set([".ts", ".tsx", ".css", ".txt", ".md"]);

async function* walk(path) {
  const entries = await readdir(path, { withFileTypes: true }).catch(() => null);
  if (!entries) {
    yield path;
    return;
  }
  for (const e of entries) {
    const p = join(path, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.has(extname(e.name))) yield p;
  }
}

const chars = new Set();
// 기본 라틴, 숫자, 문장부호와 화면에 쓰는 기호는 항상 포함
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c));
for (const c of "→←↑↓↵↗·…⌘⇧©×–—“”‘’°") chars.add(c);

for (const src of SOURCES) {
  for await (const file of walk(join(root, src))) {
    for (const ch of await readFile(file, "utf8")) chars.add(ch);
  }
}

const text = [...chars].filter((c) => c.codePointAt(0) >= 0x20).join("");
const source = await readFile(join(root, "node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"));
const subset = await subsetFont(source, text, { targetFormat: "woff2" });

const outDir = join(root, "src/app/fonts");
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "pretendard-subset.woff2"), subset);
const hangul = [...chars].filter((c) => /\p{Script=Hangul}/u.test(c)).length;
console.log(`subset-font: ${chars.size} glyphs (Hangul ${hangul}), ${(source.length / 1024).toFixed(0)}KB → ${(subset.length / 1024).toFixed(0)}KB`);
