import Link from "next/link";
import { Eyebrow, buttonClass } from "@/components/ui";
import s from "./home.module.css";

export default function NotFound() {
  return (
    <section className={s.hero}>
      <div className={`container ${s.heroText}`}>
        <Eyebrow>404</Eyebrow>
        <h1>
          <span className={s.headline}>이 좌표에는 장비가 없음</span>
        </h1>
        <p className={s.lede}>주소가 바뀌었거나 삭제된 페이지. 잘못 옮긴 거라면 ⌘Z로는 돌아갈 수 없으니 아래 버튼으로.</p>
        <div className={s.cta}>
          <Link className={buttonClass("primary")} href="/">
            처음 화면으로
          </Link>
        </div>
      </div>
    </section>
  );
}
