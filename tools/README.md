# Tools

의상 자산 파이프라인을 구성하는 CLI 도구 모음입니다. 모든 스크립트는 Node.js 18+ 환경에서 실행됩니다.

## convert-gltf

```
npm run tools:convert -- --input ./raw/sample.glb --out ./build --scale 0.01 --draco --stats
```

- 현재는 `.glb`를 입력으로 받아 `gltf-pipeline`을 통해 정규화합니다.
- 루트 노드 스케일 조정, Draco 압축, 통계 출력 옵션을 지원합니다.
- 출력 파일은 `<name>_processed.glb` 형식으로 `--out` 디렉터리에 생성됩니다.

## add-anchors

```
npm run tools:add-anchors -- --gltf ./build/sample_processed.glb --anchors ./anchors/sample_top_01.json --out ./build/sample_with_meta.glb
```

- 앵커 정의(JSON)를 검증한 뒤, GLB의 `asset.extras.garment`에 메타데이터를 삽입합니다.
- 카테고리별 필수 앵커를 체크하며, 누락 시 에러를 발생시킵니다.

## build-garment-catalog

```
npm run tools:build-catalog
```

- `frontend/assets/garments/meta/*.json`을 검사해 통합 카탈로그(`garments.generated.json`)로 변환합니다.
- 필수 필드가 누락되면 에러를 발생시키며, 생성된 카탈로그는 프론트엔드에서 바로 사용됩니다.
