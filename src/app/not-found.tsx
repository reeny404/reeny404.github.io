import Link from "next/link";
import { EmptyBoard } from "@/features/editor/EmptyBoard";
import s from "./home.module.css";

/** 첫 화면과 같은 구성. 에디터 자리에는 요청한 주소의 자리만 비어 있는 보드 */
export default function NotFound() {
  return (
    <section className={s.hero} aria-labelledby="not-found-title">
      <div className={`container ${s.heroGrid} ${s.heroGridText}`}>
        <div className={s.heroText}>
          <h1 id="not-found-title">
            <span className={s.headline}>이 좌표는 비어 있음</span>
          </h1>
          <p className={`${s.lede} ${s.ledeWide}`}>
            주소가 바뀌었거나 없는 페이지예요. <span className={s.phrase}>
              <Link href="/" className={s.ledeLink}>
                Home으로 이동
              </Link>해 계속 둘러보세요.
            </span>
          </p>
        </div>
        <EmptyBoard />
      </div>
    </section>
  );
}
