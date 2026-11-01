// [지은] 추가 (11/01): 카메라 미리보기 위에 겹쳐 놓는 필터 선택 줄
import { FILTERS, CAN_FILTER } from '../constants/filters.js'
import './FilterBar.css'

export default function FilterBar({ value, onChange, disabled }) {
  if (!CAN_FILTER) return null // 필터를 못 쓰는 브라우저에서는 아예 숨김

  return (
    <div className="fb" role="group" aria-label="필터">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`fb-chip ${value === f.id ? 'is-on' : ''}`}
          aria-pressed={value === f.id}
          disabled={disabled}
          onClick={() => onChange(f.id)}
        >
          {f.name}
        </button>
      ))}
    </div>
  )
}