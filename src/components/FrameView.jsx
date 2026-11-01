// [담당: 지은] 프레임 그리기 (템플릿 선택, 사진 선택, 결과 화면에서 공용).
// [지은] 수정 (11/01): 2차 리뉴얼 - 잉크 테두리 + 노란 하드 그림자(잉크 윤곽선), 제목 글꼴
// 
// props
//   template  : TEMPLATES 중 하나
//   photos    : 칸마다 들어갈 사진 주소 (비어 있으면 null)
//   color     : 프레임 색
//   pattern   : 프레임 패턴 (solid, gradient, stripe, check, dot)
//   onSlotClick: (칸 번호) => void  (선택 사항)
//   width     : 프레임 가로 크기(px 또는 '100%'). 안 주면 템플릿에 맞는 기본 크기
//   dashed    : true면 빈 칸을 점선으로 (사진 선택 화면용)
//   shadow    : false면 그림자 없음 (갤러리용)
//   date      : '2026.10.06' 같은 글자. 안 주면 오늘 날짜
//   showDate  : false면 날짜를 숨김 (갤러리용)

const FRAME_WIDTH = { basic: 150, tall: 220, square: 240 }

// 색이 밝은지 판단 (밝으면 글자를 진하게)
function isLight(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = n >> 16
  const g = (n >> 8) & 255
  const b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

// 오늘 날짜를 2026.10.08 형식 글자로
function todayText() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('.')
}

// [지은] 패턴별 CSS 스타일 반환 함수
function getPatternStyles(bgColor, patType) {
  const base = { backgroundColor: bgColor }
  const overlay = 'rgba(255, 255, 255, 0.5)' // 패턴을 그릴 반투명 흰색
  
  switch (patType) {
    case 'gradient':
      return { background: `linear-gradient(135deg, ${bgColor}, #ffffff)` }
    case 'stripe':
      return { 
        ...base, 
        backgroundImage: `linear-gradient(135deg, ${overlay} 25%, transparent 25%, transparent 50%, ${overlay} 50%, ${overlay} 75%, transparent 75%, transparent)`, 
        backgroundSize: '20px 20px' 
      }
    case 'check':
      return { 
        ...base, 
        backgroundImage: `conic-gradient(from 0deg, ${overlay} 90deg, transparent 90deg 180deg, ${overlay} 180deg 270deg, transparent 270deg)`, 
        backgroundSize: '20px 20px' 
      }
    case 'dot':
      return { 
        ...base, 
        backgroundImage: `radial-gradient(circle at 10px 10px, ${overlay} 4px, transparent 4.5px)`, 
        backgroundSize: '20px 20px' 
      }
    case 'solid':
    default:
      return base
  }
}

export default function FrameView({
  template,
  photos = [],
  color = '#1B1A22',
  pattern = 'solid', // [지은] 패턴 prop 추가
  onSlotClick,
  width,
  dashed = false,
  shadow = true,
  date,
  showDate = true,
}) {
  const slotCount = template.slots
  const textColor = isLight(color) ? 'var(--color-ink)' : 'var(--color-paper)'
  const dateText = date ?? todayText()

  return (
    <div
      style={{
        ...getPatternStyles(color, pattern), // [지은] 배경 스타일 적용
        padding: '12px 12px 22px',
        borderRadius: 8,
        // [지은] 수정: border 대신 outline (크기에 영향을 안 줘서 저장 이미지와 같은 크기)
        outline: '3px solid var(--color-ink)',
        width: width ?? FRAME_WIDTH[template.id] ?? 220,
        // [지은] 수정: 노란 그림자 + 그 바깥에 잉크 윤곽선(spread 3px)
        boxShadow: shadow
          ? '6px 6px 0 var(--color-brand), 6px 6px 0 3px var(--color-ink)'
          : 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
          gap: 8,
        }}
      >
        {Array.from({ length: slotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => onSlotClick?.(i)}
            style={{
              aspectRatio: template.slotRatio,
              border: photos[i] || !dashed ? 'none' : `2px dashed ${textColor}`,
              background: photos[i] || dashed ? 'transparent' : 'var(--color-muted)',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {photos[i] ? (
              <img
                src={photos[i]}
                alt={`${i + 1}번 칸`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: dashed ? textColor : 'var(--color-paper)', fontSize: 18 }}>
                {i + 1}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 6,
          color: textColor,
          fontSize: 11,
          paddingTop: 8,
        }}
      >
        <span>SnapFrame</span>
        {showDate && <span>{dateText}</span>}
      </div>
    </div>
  )
}