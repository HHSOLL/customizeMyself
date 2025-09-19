# customizeMyself

3D 온라인 피팅 MVP를 목표로 하는 PWA 기반 프로젝트입니다. 사용자는 한국어 UI에서 치수를 입력하거나 프리셋을 선택해 자신의 3D 마네킹을 생성하고, 오픈소스 의상을 실시간으로 착용/벗기며 간이 물리 효과와 스냅샷 저장을 경험하게 됩니다.

## 핵심 기능 (MVP 범위)
- 치수 입력(키, 몸무게, 어깨, 가슴, 허리 등 11개 항목) 및 성별/체형 프리셋 제공.
- 파라메트릭 마네킹 생성과 즉시 업데이트(블렌드셰이프 + 본 스케일링).
- 상/하의 카탈로그 로드, 앵커 기반 L0 래핑과 L1 PBD 물리 토글, 자동 강등.
- 캔버스 스냅샷 저장, 로컬 세션 상태 유지, 한국어 온보딩 플로우.

## 기술 스택 & 구조(예정)
- 프론트엔드: Vite + React + TypeScript, Three.js, Zustand, PWA(Service Worker, manifest).
- 백엔드: NestJS, Prisma(PostgreSQL), BullMQ(Redis), AWS S3 자산 스토리지.
- 공통 툴링: ESLint, Prettier, Husky, lint-staged, Commitlint, GitHub Actions CI/CD.
- 디렉터리 계획: `src/`(앱 코드), `src/engine/`(아바타/피팅 로직), `assets/`(마네킹·의상 glTF), `tools/`(자산 파이프라인), `tests/`(단위/통합/E2E).

## 문서
- `plan_init.md`: 제품 PRD 및 기술 스펙 v0.1 원문.
- `plan.md`: 단계별 구현 계획(7단계 + 마일스톤 매핑).
- `AGENTS.md`: 협업 에이전트를 위한 저장소 가이드라인.

## 진행 로드맵 요약
1. 저장소/CI, 프론트·백엔드 스캐폴딩, 품질 툴링.
2. 온보딩·피팅 UI 골격, 한국어 UX, 로컬 상태 관리.
3. 마네킹 파라미터 매핑, 프리셋, 스냅샷 구현.
4. 의상 자산 파이프라인, 카탈로그, L0 피팅.
5. L1 물리, 자동 티어, 성능 모니터링.
6. 백엔드 API, S3 스냅샷, 로그/분석.
7. 테스트, Lighthouse, Capacitor 래핑, 배포 자동화.

## 협업 메모
- 모든 코드 변경은 Conventional Commits 규칙을 따르고 GitHub에 `add → commit → push` 순으로 공유합니다.
- CC0/CC BY 라이선스 의상만 허용하며, 자산 메타데이터 누락 시 CI에서 빌드 실패하도록 합니다.
- 성능 목표: L0 30FPS, L1 15~30FPS. KPI는 plan_init.md의 초안을 기준으로 측정합니다.
