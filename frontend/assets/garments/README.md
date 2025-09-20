# Garment Catalog

의상 데이터는 `meta/*.json` 파일로 관리하며, `tools/build-garment-catalog` 스크립트를 통해 `garments.generated.json`으로 집계됩니다. 파이프라인은 다음 단계를 따릅니다.

1. 원본 메시를 `tools/convert-gltf`로 정규화하여 GLB를 생성합니다.
2. `tools/add-anchors`로 앵커와 기본 메타데이터를 GLB `asset.extras.garment`에 주입합니다.
3. `meta/*.json` 파일에 썸네일·라이선스 등 추가 정보를 기록합니다.
4. `npm run tools:build-catalog`를 실행하면 모든 메타 파일을 검증하고 `garments.generated.json`을 생성합니다.

## 메타 필드

- `id`: 고유 식별자
- `label`: UI에 노출되는 한국어 이름
- `category`: `top`, `bottom`, `full`
- `asset`: 번들에 포함될 GLB 경로
- `thumbnail`: 썸네일 이미지 경로
- `anchors`: 필수 앵커 ID 목록 (검증용)
- `license`: 타입, author, url
