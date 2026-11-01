// [담당: 지은] 2. 템플릿 선택 – 3종 중 고르면 위 프레임이 바뀌고, "다음"을 누르면 카메라로
// [지은] 수정 (11/01): 2차 리뉴얼. 선택 로직(usePhoto, selectTemplate)은 선배 코드 그대로
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

export default function TemplateSelect() {
  const { template, selectTemplate } = usePhoto()

  return (
    <div className="ts">
      <div className="ts-header">
        <Link to="/" className="btn">‹ 이전</Link>
        <Link to="/camera" className="btn btn-primary">다음 ›</Link>
      </div>

      <StepBar current={0} />

      <div>
        <h2 className="ts-title">프레임을 골라요</h2>
        <p className="ts-sub">선택한 모양대로 사진이 들어가요</p>
      </div>

      <div className="ts-preview">
        {/* key가 바뀌면 React가 새로 만들어서 pop 애니메이션이 다시 실행돼요 */}
        <div key={template.id} className="pop-in">
          <FrameView template={template} />
        </div>
      </div>

      <div className="ts-options">
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
    </div>
  )
}