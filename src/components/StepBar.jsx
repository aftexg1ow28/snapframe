// [지은] 추가 (11/01): 진행 표시 (프레임 → 촬영 → 선택 → 완성)
// 사용: <StepBar current={0} />  (0=프레임, 1=촬영, 2=선택, 3=완성)
const STEPS = ['프레임', '촬영', '선택', '완성']

export default function StepBar({ current = 0 }) {
  return (
    <ol className="stepbar" aria-label="진행 단계">
      {STEPS.map((label, i) => (
        <li
          key={label}
          className={`stepbar-item ${i === current ? 'is-now' : ''} ${i < current ? 'is-done' : ''}`}
        >
          <span className="stepbar-num">{i < current ? '✓' : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}