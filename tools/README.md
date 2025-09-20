# Tools

자산 변환 및 검증을 위한 CLI 도구 모음입니다. 현재는 스텁 상태로 동작하며, 후속 단계에서 실제 glTF 변환과 앵커 주입 로직을 연결할 예정입니다.

## convert-gltf

```
node tools/convert-gltf.js --input sample.fbx --out ./build --scale 0.01 --triangulate
```

- FBX/OBJ 등 원본 모델을 glTF 2.0 포맷으로 변환하는 파이프라인의 뼈대입니다.
- 옵션은 로그만 남기며, 추후 `gltf-transform` 혹은 `assimp` 기반 변환기로 교체됩니다.

## add-anchors

```
node tools/add-anchors.js --gltf ./build/sample.glb --anchors anchors.json --out ./build/sample_with_anchors.glb
```

- 의상 메시의 필수 앵커(shoulder, waist 등)를 JSON으로 주입하는 스텁입니다.
- 스키마 검증만 수행하며, 아직 glTF 수정은 하지 않습니다.
