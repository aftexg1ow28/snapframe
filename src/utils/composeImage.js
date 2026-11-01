// [담당: 원영] canvas로 프레임 + 사진 4장을 합쳐 최종 이미지
//
// 입력
//   template   : TEMPLATES 중 하나 (cols, slots, slotRatio 사용)
//   photos     : 칸 순서대로 정리된 사진 주소 배열 (길이 4)
//   rotations  : photos와 같은 순서의 회전 각도 (0/90/180/270...)
//   frameColor : 프레임 배경색
//   date       : 'YYYY.MM.DD' 문자열
// 출력
//   Promise<string> : 완성된 이미지의 dataURL (png)
//
// 모양은 components/FrameView.jsx(화면 미리보기)와 똑같이 /아래 숫자들은 FrameView 값
//  - 프레임 가로(FRAME_WIDTH), 안쪽 여백 12 / 12 / 22, 칸 사이 간격 8, 글자 크기 11
//  - 미리보기는 화면 픽셀이라 작아서 SCALE배 키워서 선명하게
const SCALE = 4
const FRAME_WIDTH = { basic: 150, tall: 220, square: 240 } // FrameView.jsx 와 같게 유지
const PAD_X = 12
const PAD_TOP = 12
const PAD_BOTTOM = 22
const GAP = 8
const FOOTER_TOP = 8
const FOOTER_H = 16
const FONT_SIZE = 11

// 색이 밝은지 판단 밝은 프레임이면 글자를 진하게
function isLight(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = n >> 16
  const g = (n >> 8) & 255
  const b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

// 사진 주소 → 그릴 수 있는 이미지로
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('사진을 불러오지 못했어요'))
    img.src = src
  })
}

// 사진을 칸(x, y, w, h)에 꽉 채워(cover) 그리기. rotation만큼 돌려서
function drawCover(ctx, img, x, y, w, h, rotation) {
  const turns = (((rotation / 90) % 4) + 4) % 4 // 0~3
  const sideways = turns % 2 === 1 // 90°, 270°면 가로세로가 바꾸기
  const boxW = sideways ? h : w // 돌리기 전 기준으로 채워야 해서 맞바꾸기
  const boxH = sideways ? w : h
  const scale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h) // 칸 밖으로 삐져나온 부분은 자르기
  ctx.clip()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

export async function composeImage({ template, photos, rotations = [], frameColor = '#1B1A22', date = '' }) {
  const frameW = FRAME_WIDTH[template.id] ?? 220
  const cols = template.cols
  const slotCount = template.slots
  const rows = Math.ceil(slotCount / cols)

  // 칸 크기 (FrameView의 grid와 같은 계산)
  const slotW = (frameW - PAD_X * 2 - GAP * (cols - 1)) / cols
  const slotH = slotW / template.slotRatio
  const gridH = rows * slotH + (rows - 1) * GAP
  const frameH = PAD_TOP + gridH + FOOTER_TOP + FOOTER_H + PAD_BOTTOM

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(frameW * SCALE)
  canvas.height = Math.round(frameH * SCALE)
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE) // 이제부터는 미리보기 크기 그대로 좌표를 쓰면 돼요

  // 1) 프레임 바탕
  ctx.fillStyle = frameColor
  ctx.fillRect(0, 0, frameW, frameH)

  // 2) 사진 칸마다 그리기 (사진이 없는 칸은 회색)
  const images = await Promise.all(photos.map((p) => (p ? loadImage(p) : null)))
  for (let i = 0; i < slotCount; i++) {
    const x = PAD_X + (i % cols) * (slotW + GAP)
    const y = PAD_TOP + Math.floor(i / cols) * (slotH + GAP)
    if (images[i]) {
      drawCover(ctx, images[i], x, y, slotW, slotH, rotations[i] ?? 0)
    } else {
      ctx.fillStyle = '#4A4853'
      ctx.fillRect(x, y, slotW, slotH)
    }
  }

  // 3) 아래쪽 글자: 왼쪽 SnapFrame, 오른쪽 날짜
  ctx.fillStyle = isLight(frameColor) ? '#1B1A22' : '#F4EFE6'
  ctx.font = `${FONT_SIZE}px ${getComputedStyle(document.body).fontFamily || 'sans-serif'}`
  ctx.textBaseline = 'top'
  const textY = PAD_TOP + gridH + FOOTER_TOP
  ctx.textAlign = 'left'
  ctx.fillText('SnapFrame', PAD_X, textY)
  ctx.textAlign = 'right'
  ctx.fillText(date, frameW - PAD_X, textY)

  // 4) 사진 파일(png) 주소로
  return canvas.toDataURL('image/png')
}

// 영상(video)에서 한 장 캡처: 칸 비율(ratio = 가로/세로)에 맞게 가운데를 잘라요.
// mirror가 true면 좌우를 뒤집어요 (전면 카메라는 미리보기가 거울처럼 보이니까, 찍힌 사진도 똑같이 맞춰요)
// 용량을 줄이려고 JPEG(품질 0.92)로 만들어요. 6장을 메모리에 들고 있어야 해서 PNG보다 훨씬 가벼워요.
// [지은] 수정 (11/01): filter(CSS filter 문자열)를 받아서 사진에 구워 넣어요. 안 주면 'none'
export function captureFromVideo(video, ratio, mirror = false, filter = 'none') {
  const vw = video.videoWidth
  const vh = video.videoHeight
  let sw = vw
  let sh = vw / ratio
  if (sh > vh) {
    sh = vh
    sw = vh * ratio
  }
  const sx = (vw - sw) / 2
  const sy = (vh - sh) / 2
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')
  if (filter && filter !== 'none') ctx.filter = filter // [지은] 추가: 이후에 그리는 그림에 필터가 적용돼요
  if (mirror) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}