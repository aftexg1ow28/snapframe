// [담당: 지은] 4. 사진 선택
// (막히면 원영에게: 한 번/두 번 클릭 구분 → 타이머)
// - 한 번 클릭: 사진 확대 팝업(회전/닫기), 두 번 클릭: 바로 프레임에 넣기
// - 프레임의 사진을 누르면 빠짐, 프레임 무늬/색상 선택, 다시 찍기(전체 초기화) / 나가기
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePhoto } from '../context/PhotoContext.jsx'
import FrameView from '../components/FrameView.jsx'
import ColorPicker from '../components/ColorPicker.jsx'
import RotatedImage from '../components/RotatedImage.jsx'
import PhotoPreviewModal from '../components/PhotoPreviewModal.jsx'
import './PhotoSelect.css'

const DOUBLE_CLICK_MS = 250

// [지은] 추가: 선택 가능한 프레임 무늬 목록
const PATTERNS = [
  { id: 'solid', label: '단색' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'stripe', label: '스트라이프' },
  { id: 'check', label: '체크' },
  { id: 'dot', label: '도트' },
]

export default function PhotoSelect() {
  const navigate = useNavigate()
  
  // [지은] frameStyle, setFrameStyle 추가
  const { 
    template, shots, slots, rotations, 
    frameColor, setFrameColor, 
    frameStyle, setFrameStyle, 
    placePhoto, removeFromSlot, rotateShot, resetShots 
  } = usePhoto()

  const slotPhotos = slots.map((idx) => (idx == null ? null : shots[idx]))
  const slotRotations = slots.map((idx) => (idx == null ? 0 : rotations[idx] ?? 0))

  const total = slots.length
  const filledCount = slots.filter((idx) => idx != null).length
  const isFull = total > 0 && filledCount >= total
  const isPlaced = (i) => slots.includes(i)
  const takenCount = shots.filter(Boolean).length

  const clickTimer = useRef(null)
  const lastClicked = useRef(null)
  const [previewIdx, setPreviewIdx] = useState(null)

  useEffect(() => () => clearTimeout(clickTimer.current), [])

  const handleShotClick = (i) => {
    if (clickTimer.current && lastClicked.current === i) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      lastClicked.current = null
      if (!isPlaced(i) && !isFull) placePhoto(i)
      return
    }
    clearTimeout(clickTimer.current)
    lastClicked.current = i
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      lastClicked.current = null
      setPreviewIdx(i)
    }, DOUBLE_CLICK_MS)
  }

  const closePreview = () => setPreviewIdx(null)

  const retake = () => {
    resetShots()
    navigate('/camera')
  }

  return (
    <div className="screen select">
      <header className="select-header">
        <button className="btn" onClick={retake}>↻ 재촬영</button>
        <span className="select-title">사진 선택 {filledCount}/{total}</span>
        <Link to="/" className="btn">나가기 ✕</Link>
      </header>

      <div className="select-frame">
        {/* [지은] 수정: pattern={frameStyle} 연동 추가 */}
        <FrameView 
          template={template} 
          photos={slotPhotos} 
          rotations={slotRotations} 
          color={frameColor} 
          pattern={frameStyle} 
          onSlotClick={removeFromSlot} 
        />
      </div>

      <p className="select-hint">
        <b>한 번 클릭</b> 사진 확인 · <b>두 번 클릭</b> 바로 선택
      </p>

      <div className="shot-strip">
        {shots.map((url, i) =>
          url ? (
            <button
              key={i}
              className={`shot${isPlaced(i) ? ' shot-placed' : ''}`}
              onClick={() => handleShotClick(i)}
            >
              <span className="shot-badge">{i + 1}</span>
              <div className="shot-img">
                <RotatedImage src={url} rotation={rotations[i] ?? 0} alt={`${i + 1}번째 컷`} />
              </div>
            </button>
          ) : null
        )}
      </div>
      <p className="select-sub">
        {takenCount === 0 ? '찍은 사진이 없어요. 재촬영을 눌러주세요' : `좌우로 넘겨 찍은 ${takenCount}컷 확인`}
      </p>

      {/* [지은] 추가: 무늬 선택 영역 */}
      <div style={{ textAlign: 'center', margin: '16px 0 8px' }}>
        <h3 style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>무늬</h3>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {PATTERNS.map((pat) => (
            <button
              key={pat.id}
              onClick={() => setFrameStyle(pat.id)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
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

      {/* [지은] 기존 색상 선택기 래핑 */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>색상</h3>
        <ColorPicker value={frameColor} onChange={setFrameColor} />
      </div>

      <button
        className="btn btn-primary select-next"
        disabled={!isFull}
        onClick={() => navigate('/result')}
      >
        다음 ›
      </button>

      {previewIdx != null && (
        <PhotoPreviewModal
          url={shots[previewIdx]}
          rotation={rotations[previewIdx] ?? 0}
          onRotate={(delta) => rotateShot(previewIdx, delta)}
          onClose={closePreview}
        />
      )}
    </div>
  )
}