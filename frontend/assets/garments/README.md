# Garment Catalog (Stub)

`garments.sample.json`은 도구 파이프라인이 준비되기 전까지 사용할 플레이스홀더 데이터입니다. 실제 배포에서는 `tools/convert-gltf`와 `tools/add-anchors`를 통해 생성된 메타데이터를 기반으로 이 파일을 자동 생성할 예정입니다.

필드 설명:

- `id`: 고유 식별자
- `label`: UI에 노출되는 이름 (한국어)
- `category`: `top` 또는 `bottom`
- `asset`: glTF 자산 경로
- `thumbnail`: 썸네일 이미지 경로
- `anchors`: 필수 앵커 ID 목록 (검증용)
- `license`: 저작권/출처 정보
