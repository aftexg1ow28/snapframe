// [지은] 추가 (11/01): 카메라 필터 목록
// css: 미리보기(<video>의 style)와 사진 캡처(canvas ctx.filter)에 똑같이 쓰는 값
export const FILTERS = [
  { id: 'none', name: '원본', css: 'none' },
  { id: 'mono', name: '흑백', css: 'grayscale(1) contrast(1.1)' },
  { id: 'film', name: '필름', css: 'sepia(0.35) contrast(1.1) saturate(1.15) brightness(1.03)' },
  { id: 'vivid', name: '비비드', css: 'saturate(1.6) contrast(1.08)' },
  { id: 'soft', name: '뽀얀', css: 'brightness(1.1) contrast(0.92) saturate(1.1)' },
  { id: 'retro', name: '레트로', css: 'sepia(0.5) hue-rotate(-15deg) saturate(1.3) contrast(1.05)' },
]

// 이 브라우저의 canvas가 필터를 지원하는지 확인해요.
// 지원하지 않으면 미리보기와 저장된 사진이 달라지니, 그 경우엔 필터 버튼을 숨겨요.
export const CAN_FILTER =
  typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype