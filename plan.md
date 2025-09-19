# 단계별 구현 계획

## 1단계: 저장소 및 작업 환경 구축
- Git 초기화 및 원격 저장소(`https://github.com/HHSOLL/customizeMyself.git`) 연동, 브랜치 전략(main + feature/*) 정의.
- 프론트엔드(Vite + React + TypeScript PWA)와 백엔드(NestJS) 스캐폴딩 후 루트 `package.json`에서 공통 스크립트 연결.
- ESLint, Prettier, Husky, lint-staged, Commitlint 설정으로 코드 품질 가드 구성.
- GitHub Actions 워크플로우 초안 추가: 프론트 빌드/테스트, 백엔드 빌드/테스트, 성공 시 S3+CloudFront·ECS 배포 단계 placeholder.

## 2단계: 핵심 UX 골격 구현
- 온보딩 플로우(성별 선택 → 체형 프리셋 → 치수 입력 → 마네킹 생성 버튼) 화면 및 라우트 구성.
- 피팅 장면의 3D 뷰, 우측 컨트롤 패널, 하단 의상 카탈로그 UI 스켈레톤 작성.
- Zustand 기반 전역 상태(or Recoil)로 치수/프리셋/물리 옵션 관리, 로컬스토리지 persistence 스텁 구현.
- 한국어 UI 카피 초안 적용 및 반응형 레이아웃 검증.

## 3단계: 마네킹 엔진 초기 버전
- `assets/avatar/`에 남/여 베이스 glb 확보(임시 CC0) 및 Three.js 로더 파이프라인 구축.
- `src/engine/avatar/paramMap.ts`에서 치수→블렌드셰이프·본 스케일 매핑 로직 1차 작성.
- `applyAvatarParams` 유틸과 UI→엔진 연결 디바운스(100ms) 처리, 150ms 갱신 목표 프로파일링.
- 성별/프리셋에 따른 기본 치수 세트 정의 및 유효 범위 검증.

## 4단계: 의상 자산 파이프라인 및 카탈로그
- `tools/convert_gltf` CLI(파일 변환, 스케일 정규화, 삼각화, PBR 체크) 구현.
- `tools/add_anchors`로 앵커 JSON 주입 및 필수 키 검증 로직 작성.
- 오픈소스 의상 샘플 2~3종 처리 후 `garments.json` 카탈로그 생성, 라이선스/저자 필수 필드 검증 테스트 추가.
- 프론트엔드에서 의상 로드, 프리뷰 썸네일, 착용/벗기기 상태 전환 기능 연동.

## 5단계: 피팅 로직과 물리 계층
- `fit/L0.ts`에 앵커 정합→ARAP→노멀 푸시 순서 구현 및 L0 착용 퍼포먼스 측정.
- `fit/L1.ts`에 PBD 기반 거리·굽힘 제약, 스피어/캡슐 충돌 처리, 스텝/반복 튜닝.
- FPS 모니터링 유틸(`fit/autoTier.ts`) 추가, 3초간 24FPS 미만 시 자동 L0 강등.
- UI 물리 토글과 자동 강등 알림 UX 구성, 성능 로그 수집(PWA Performance API) 저장.

## 6단계: 백엔드 API 및 저장 기능
- NestJS에서 측정치, 아바타, 피팅, 스냅샷 API 엔드포인트 구현 및 Prisma 스키마 정의.
- S3 프리사인 URL 발급 플로우(`POST /api/snapshot`)와 로컬 우선 모드 토글 옵션 제공.
- BullMQ 워커로 자산 검증/후처리 큐 스텁 추가, Redis 연결 구성.
- Swagger(OpenAPI) 문서 자동화 및 인증(로컬 API 키) 플레이스홀더 적용.

## 7단계: 품질, 테스트, 릴리즈 준비
- 단위 테스트(ParamMap, L0/L1 핵심 로직), 의상 파이프라인 CLI 통합 테스트, Playwright E2E(U1~U4) 작성.
- Lighthouse CI로 성능/접근성 80+ 기준 측정, 개선 태스크 반영.
- Sentry/GA4 연동 초기 설정, KPI 메트릭 로깅 이벤트 트래킹.
- Capacitor 래핑 템플릿 생성(iOS/Android), 빌드 스크립트 및 배포 체크리스트 정리 후 MVP 릴리즈 태그(`mvp-0.1.0`).

## 마일스톤 매핑
- W1: 1~2단계 완료 및 ParamMap v0 스텁.
- W2: 3단계 마무리, 프리셋/스냅샷 기능 안정화.
- W3: 4~5단계 주력, L0 피팅 및 물리 토글.
- W4: 6~7단계, 성능 튜닝과 CI/CD·배포 준비.
