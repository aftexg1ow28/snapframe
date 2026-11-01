import { Link } from 'react-router-dom'
import { TEMPLATE_LIST } from '../constants/templates.js'
import { usePhoto } from '../context/PhotoContext.jsx'
import FrameView from '../components/FrameView.jsx'
import StepBar from '../components/StepBar.jsx'
import './TemplateSelect.css'

const ICON_SIZE = {
  basic: [35, 58],
  tall: [46, 62],
  square: [54, 54],
}

export default function TemplateSelect() {
  const { template, selectTemplate, frameColor, frameStyle } = usePhoto()

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
        <div key={`${template.id}-${frameStyle}-${frameColor}`} className="pop-in">
          <FrameView 
            template={template} 
            color={frameColor}
            pattern={frameStyle} 
          />
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