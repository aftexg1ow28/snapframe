// [담당: 지은] 2. 템플릿 선택 - 3종 중 고르면 위 프레임이 바뀌고, "다음"을 누르면 카메라로
// [지은] 수정 (11/01): 2차 리뉴얼. 선택 로직(usePhoto, selectTemplate)은 선배 코드 그대로
// [지은] 수정 (11/02): 프레임 패턴(무늬) 및 색상 선택 기능 추가
import { Link } from 'react-router-dom'
import { TEMPLATE_LIST } from '../constants/templates.js'
import { usePhoto } from '../context/PhotoContext.jsx'
import FrameView from '../components/FrameView.jsx'
import StepBar from '../components/StepBar.jsx'
import './TemplateSelect.css'

// 카드 위 작은 아이콘의 크기 [가로, 세로]
const ICON_SIZE = {
  basic: [35, 58],
  tall: [46, 62],
  square: [54, 54],
}

// [지은] 추가: 선택 가능한 프레임 무늬 목록
const PATTERNS = [
  { id: 'solid', label: '단색' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'stripe', label: '스트라이프' },
  { id: 'check', label: '체크' },
  { id: 'dot', label: '도트' },
]

// [지은] 추가: 선택 가능한 색상 목록
const COLORS = ['#1B1A22', '#F4EFE6', '#FFD600', '#FF5B5B', '#4A90E2', '#50E3C2']

export default function TemplateSelect() {
  const { 
    template, selectTemplate, 
    frameColor, setFrameColor, 
    frameStyle, setFrameStyle 
  } = usePhoto()

  return (
    <div className="ts">
      <div className="ts-header">
        <Link to="/" className="btn">◁ 이전</Link>
        <Link to="/camera" className="btn btn-primary">다음 ▷</Link>
      </div>

      <StepBar current={0} />

      <div>
        <h2 className="ts-title">프레임을 골라요</h2>
        <p className="ts-sub">선택한 모양대로 사진이 들어가요</p>
      </div>

      <div className="ts-preview">
        {/* key가 바뀌면 React가 새로 만들어서 pop 애니메이션이 다시 실행돼요 */}
        <div key={`${template.id}-${frameStyle}-${frameColor}`} className="pop-in">
          {/* [지은] 수정: color와 pattern props 전달 */}
          <FrameView 
            template={template} 
            color={frameColor}
            pattern={frameStyle} 
          />
        </div>
      </div>

      {/* 1. 레이아웃(모양) 선택 */}
      <div className="ts-options" style={{ marginBottom: '24px' }}>
        {TEMPLATE_LIST.map((t) => {
          const [title, ...rest] = t.name.split(' ')
          const [w, h] = ICON_SIZE[t.id] ?? [46, 58]

          return (
            <button
              key={t.id}
              className={`ts-option ${template.id === t.id ? 'is-selected' : ''}`}
              onClick={() => selectTemplate(t.id)}
            >
              <span
                className="ts-icon"
                style={{
                  width: w,
                  height: h,
                  gridTemplateColumns: `repeat(${t.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${t.slots / t.cols}, 1fr)`,
                }}
              >
                {Array.from({ length: t.slots }).map((_, i) => (
                  <i key={i} />
                ))}
              </span>
              <span className="ts-option-name">{title}</span>
              <span className="ts-option-desc">{rest.join(' ')}</span>
            </button>
          )
        })}
      </div>

      {/* [지은] 추가 2. 프레임 패턴(무늬) 선택 */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>무늬</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PATTERNS.map((pat) => (
            <button
              key={pat.id}
              onClick={() => setFrameStyle(pat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: frameStyle === pat.id ? '2px solid var(--color-ink)' : '1px solid var(--color-muted)',
                background: frameStyle === pat.id ? 'var(--color-brand)' : 'var(--color-paper)',
                cursor: 'pointer',
                fontWeight: frameStyle === pat.id ? 'bold' : 'normal'
              }}
            >
              {pat.label}
            </button>
          ))}
        </div>
      </div>

      {/* [지은] 추가 3. 프레임 색상 선택 */}
      <div>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>색상</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setFrameColor(c)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: c,
                border: frameColor === c ? '3px solid var(--color-ink)' : '1px solid var(--color-muted)',
                cursor: 'pointer'
              }}
              aria-label={`${c} 색상 선택`}
            />
          ))}
        </div>
      </div>

    </div>
  )
}