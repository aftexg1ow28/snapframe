// [담당: 지은] 5. 저장·내보내기
// (막히면 원영에게: 이미지 다운로드, 공유 API)
//   - 가운데 완성본, 아래 저장하기(다운로드) / 내보내기(공유) / 홈으로
//   - 완성본은 utils/composeImage.js 로 (원영 담당)
//   - 폰 갤러리 저장은 웹에서 직접 쓸 수 없어서 "다운로드" 또는 "공유창(navigator.share)"으로 대체
import { useEffect, useState } from 'react' // [지은] 합성 이미지/안내 문구 상태용
import { Link } from 'react-router-dom'
import { usePhoto } from '../context/PhotoContext.jsx'
import FrameView from '../components/FrameView.jsx'
import { composeImage } from '../utils/composeImage.js' // [지은] 완성본 만들기 (원영 구현 전에는 null 반환)
import * as storage from '../utils/storage.js' // [지은] 비어 있어도 에러 안 나게 통째로 import
import './Result.css'

// [지은] 수정(10/12): 목업처럼 버튼 위에 들어갈 아이콘 (다운로드, 공유, 홈)
const iconProps = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}
const IconDownload = () => (<svg {...iconProps}><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></svg>)
const IconShare = () => (<svg {...iconProps}><path d="M12 15V4m0 0L8 8m4-4 4 4M6 12v7h12v-7" /></svg>)
const IconHome = () => (<svg {...iconProps}><path d="M4 11l8-7 8 7v9H4z" /></svg>)

// [지은] 오늘 날짜를 'YYYY.MM.DD'로 만들기 (composeImage에 넘길 날짜)
const getToday = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

export default function Result() {
  const { template, shots, slots, frameColor, frameStyle, rotations = [], resetAll } = usePhoto()
  const slotPhotos = slots.map((idx) => (idx == null ? null : shots[idx]))

  const [date] = useState(getToday)
  const [composed, setComposed] = useState(null) // [지은] 합성된 이미지 dataURL (없으면 null)
  const [message, setMessage] = useState('') // [지은] 저장/공유 결과 안내 문구

  // [지은] 화면에 들어오면 사진 4장 + 프레임을 합성해서 완성본 만들기
  useEffect(() => {
    if (slotPhotos.length === 0 || slotPhotos.some((p) => p == null)) return
    let cancelled = false
    const slotRotations = slots.map((idx) => (idx == null ? 0 : rotations[idx] ?? 0))
    comcomposeImage({ template, photos: slotPhotos, rotations: slotRotations, frameColor, frameStyle, date })
  .then((url) => { if (!cancelled) setComposed(url) })
      .catch(() => { if (!cancelled) setComposed(null) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, shots, slots, frameColor, rotations, date])

  const fileName = `snapframe-${date.replaceAll('.', '')}.png`

  // [지은] dataURL을 파일로 다운로드
  const download = (url) => {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }

  // [지은] 저장하기: 다운로드 + (storage.js가 완성되면) 앱 안 갤러리에도 저장
  const handleSave = async () => {
    if (!composed) {
      setMessage('완성 이미지를 아직 만들 수 없어요 (합성 기능 준비 중)')
      return
    }
    download(composed)
    if (typeof storage.saveToGallery === 'function') {
      try {
        await storage.saveToGallery(composed)
        setMessage('다운로드했고 앱 갤러리에도 저장했어요!')
      } catch {
        setMessage('다운로드는 됐지만 앱 갤러리 저장에 실패했어요')
      }
    } else {
      setMessage('다운로드했어요!')
    }
  }

  // [지은] 내보내기: 공유창(navigator.share), 지원 안 하면 다운로드로 대체
  const handleShare = async () => {
    if (!composed) {
      setMessage('완성 이미지를 아직 만들 수 없어요 (합성 기능 준비 중)')
      return
    }
    try {
      const blob = await (await fetch(composed)).blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'SnapFrame' })
      } else {
        download(composed)
        setMessage('이 브라우저는 공유를 지원하지 않아 다운로드했어요')
      }
    } catch (e) {
      if (e.name !== 'AbortError') setMessage('공유에 실패했어요') // 사용자가 직접 닫은 건 무시
    }
  }

  return (
    <div className="screen result">
      {/* [지은] 수정(10/12): 목업처럼 이전 / 완성! / 나가기를 한 줄로 */}
      <header className="result-header">
        <Link to="/select" className="btn">‹ 이전</Link>
        <h2 className="result-title">완성!</h2>
        <Link to="/" className="btn" onClick={resetAll}>나가기 ✕</Link>
      </header>

      {/* [지은] 수정(10/12): 완성본/프레임을 가운데 정렬 (가로+세로) */}
      <div className="result-stage">
        {composed ? (
          <img className="result-image" src={composed} alt="완성된 네 컷 사진" />
        ) : (
          <FrameView template={template} photos={slotPhotos} color={frameColor} pattern={frameStyle} />
        )}
      </div>

      {/* [지은] 수정(10/12): 한 줄에 들어가게 문구를 줄임 */}
      <p className="result-note">{message || '저장하면 사진 파일과 앱 갤러리에 함께 저장돼요'}</p>

      {/* [지은] 수정(10/12): 아이콘 + 글자를 세로로 쌓은 버튼 3개 (저장하기가 가장 넓음) */}
      <div className="result-actions">
        <button className="btn btn-primary result-save" onClick={handleSave}>
          <IconDownload />
          <span>저장하기</span>
        </button>
        <button className="btn result-share" onClick={handleShare}>
          <IconShare />
          <span>내보내기</span>
        </button>
        <Link to="/" className="btn result-home" onClick={resetAll}>
          <IconHome />
          <span>홈으로</span>
        </Link>
      </div>
    </div>
  )
}