import type { Metadata } from "next";
import Link from "next/link";
import { CaseBody, CaseHero, Chapter, Pager } from "@/components/case";
import { Compare, MetricList, Note } from "@/components/ui";
import { JsonLd, caseJsonLd, caseMetadata } from "@/components/site/JsonLd";
import { caseStudies } from "@/content/cases";

const { title } = caseStudies.miridih;

export const metadata: Metadata = caseMetadata("miridih");

export default function MiridihPage() {
  return (
    <>
      <JsonLd data={caseJsonLd("miridih")} />
      <CaseHero
        slug="miridih"
        eyebrow="Case 03 · 미리디"
        title={title}
        lede="MAU 200만(2021년 기준) 웹 디자인 도구에서 저장 실패와 초기 로딩 지연, 세션에 의존하던 결제 데이터의 유실을 다룬 작업."
        meta={[
          ["역할", "Full-Stack Engineer"],
          ["기간", "2016.11 ~ 2021.03"],
          ["자료 기준", "당시 직접 관리한 업무 기록"],
        ]}
      />
      <CaseBody>
        <MetricList
          inline
          items={[
            { label: "저장 실패율", before: "18%", after: "2%" },
            { label: "저장 관련 VOC 비중", before: "25%", after: "6%" },
            { label: "초기 로딩", before: "19초", after: "4초" },
            { label: "결제 데이터 유실", before: "월 12건", after: "0건" },
          ]}
        />

        <Chapter id="save" index="01 저장" title="무한 로딩으로 나타나던 저장 실패">
          <p className="prose">
            저장 버튼을 눌러도 무한 로딩 끝에 작업물이 저장되지 않는 문제. 개별 버튼이나 API 재호출 문제로 보지 않고 캔버스 상태가 저장 데이터가 되고 저장 완료로 판단되기까지의 흐름 추적. 저장 로직을 액션 단위로 나누고 이벤트 로그로 실패 구간을 분석한 뒤 저장 구조 개선.
          </p>
          <p className="prose">결과로 저장 실패율 18% → 2%, 저장 관련 VOC 비중 25% → 6%.</p>
        </Chapter>

        <Chapter id="loading" index="02 로딩과 렌더링" title="19초 걸리던 초기 화면">
          <p className="prose">
            초기 진입 지연과 다수 요소를 렌더링할 때 발생하는 OOM, 브라우저 다운 문제 분석과 개선. 초기 로딩에서 시간을 쓰는 작업을 나누고 불필요한 초기 작업과 렌더링 병목을 줄여 초기 로딩 19초 → 4초.
          </p>
        </Chapter>

        <Chapter id="payment" index="03 결제" title="세션보다 오래 살아야 하는 결제 데이터">
          <Compare
            before={["상품 인덱스와 결제 상태를 세션에 저장", "세션 유실 시 결제 데이터 누락", "개발팀이 로그를 찾아 유실 결제를 수동 입력"]}
            after={["DDD와 pipeline 구조로 DB 중심 결제 구조 재설계", "A/B 분기로 신규 구조의 적용 비율을 점진 확대", "전환 중 DB 지표와 VOC 모니터링"]}
          />
          <p className="prose">
            한 번에 전환할 때의 장애 위험을 줄이기 위해 점진 전환 선택. 결제 데이터 유실 월 12건 → 0건, 결제 관련 VOC 10% 감소(상대 비율), 수동 입력 요청 소멸.
          </p>
        </Chapter>

        <Chapter id="etc" index="04 그 밖의 작업" title="상품 후기와 TypeScript">
          <p className="prose">
            옵션별 필터링과 포토 리뷰 등 상품 후기 기능 개발, 필요한 데이터 스키마 변경과 DB Migration 수행. TypeScript를 도입해 타입을 활용한 개발과 유지보수 기반 마련.
          </p>
          <Note label="자료 기준" tone="caution">
            수치는 재직 당시 직접 관리한 업무 기록 기준. 사내 코드와 문서는 공개할 수 없어 결과 위주로 정리. 측정 방식과 판단 기준이 궁금한 경우{" "}
            <Link href="/#contact">문의</Link>해 주세요.
          </Note>
        </Chapter>

        <Pager
          prev={{ href: "/work/chipnsoda/", label: "ChipNSoDA 실시간 작업 상태", dir: "이전 사례" }}
          next={{ href: "/system/", label: "이 사이트의 디자인 시스템", dir: "다음으로" }}
        />
      </CaseBody>
    </>
  );
}
