// [지은] 프레임 색상 선택 (원형 10개, 누르면 색이 바뀌게)
// [지은] 수정 (11/01): 2차 리뉴얼 – 선택된 색이 스티커처럼 떠올라요. 선택 로직(value/onChange)은 선배 코드 그대로
import { FRAME_COLORS } from '../constants/colors.js'
import './ColorPicker.css'

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="cp" role="group" aria-label="프레임 색상">
      {FRAME_COLORS.map((c) => (
        <button
          key={c.hex}
          type="button"
          className={`cp-dot ${value === c.hex ? 'is-selected' : ''}`}
          aria-label={`프레임 색상 ${c.name}`}
          aria-pressed={value === c.hex}
          style={{ background: c.hex }}
          onClick={() => onChange(c.hex)}
        />
      ))}
    </div>
  )
}