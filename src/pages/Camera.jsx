// [담당: 원영] 3. 카메라 - 템플릿에 따라 촬영 화면 비율이 다름
// - 전면/후면 전환, 3·2·1 카운트다운 후 촬영, 6컷이 차면 /select 로 자동 이동
// - 타이머는 기본 켜짐. 셔터 옆 버튼으로 끄면 누르는 즉시 촬영 (선택은 브라우저에 기억)
// - 카메라 접근: navigator.mediaDevices.getUserMedia (HTTPS 또는 localhost 에서만 동작)
// - 캡처: utils/composeImage.js 의 captureFromVideo(video, template.cameraRatio, 거울모드)
// - [지은] 수정 (11/01): 실시간 필터 추가 (filterId 상태, FilterBar, captureFromVideo에 filter 전달)

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePhoto } from '../context/PhotoContext.jsx'
import { TOTAL_SHOTS } from '../constants/templates.js'
import { FILTERS } from '../constants/filters.js'
import FilterBar from '../components/FilterBar.jsx'
import { captureFromVideo } from '../utils/composeImage.js'
import './Camera.css'

const COUNTDOWN_START = 3 // 3, 2, 1 후에 촬영
const AUTO_NEXT_MS = 1500 // 6컷이 차면 이 시간 뒤에 사진 선택 화면으로
const MIN_GAP_MS = 400 // 타이머 없이 연타해도 이 시간 안에는 한 번만 찍히게 (실수로 두 장 찍는 것 방지)
const TIMER_KEY = 'snapframe.timer' // 타이머 켬/끔을 브라우저에 기억해 두는 이름

// 저장된 타이머 설정 읽기: 저장된 게 없거나 읽을 수 없으면 기본값 "켜짐"
function loadTimerOn() {
  try {
    return localStorage.getItem(TIMER_KEY) !== 'off'
  } catch {
    return true
  }
}

// 카메라를 못 켰을 때 사용자에게 보여줄 안내 문구
function cameraErrorMessage(err) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return '이 주소에서는 카메라를 쓸 수 없어요. https 또는 localhost 주소로 접속해 주세요.'
  }
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return '카메라 권한이 꺼져 있어요. 주소창 왼쪽 아이콘에서 카메라를 허용한 뒤 다시 시도해 주세요.'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return '사용할 수 있는 카메라를 찾지 못했어요.'
    case 'NotReadableError':
      return '다른 앱이 카메라를 쓰고 있어요. 그 앱을 닫고 다시 시도해 주세요.'
    default:
      return '카메라를 켜지 못했어요. 다시 시도해 주세요.'
  }
}

export default function Camera() {
  const navigate = useNavigate()
  const { template, shots, addShot, resetShots } = usePhoto()
  const taken = shots.filter(Boolean).length

  const videoRef = useRef(null)
  const [facing, setFacing] = useState('user') // 'user' 전면 | 'environment' 후면
  const [mirrored, setMirrored] = useState(true) // 전면 카메라는 거울처럼 좌우 반전해서 보여줘요
  const [ready, setReady] = useState(false) // 영상이 나오고 있는지
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0) // "다시 시도"를 누르면 카메라를 다시 켜기 위한 번호
  const [count, setCount] = useState(null) // 카운트다운 숫자 (null이면 카운트다운 중 아님)
  const [flash, setFlash] = useState(false) // 찰칵! 하얗게 번쩍
  const [finished, setFinished] = useState(false) // 6컷을 다 찍었는지
  const [timerOn, setTimerOn] = useState(loadTimerOn) // true면 3·2·1 후 촬영, false면 바로 촬영
  const lastShotAt = useRef(0) // 마지막으로 찍은 시각 (연타 방지용)

  // [지은] 추가: 지금 고른 필터 (기본은 원본)
  const [filterId, setFilterId] = useState('none')
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0]

  // 타이머 안에서 "가장 최신 값"을 읽기 위한 보관함
  const latest = useRef({})
  useEffect(() => {
    // [지은] 수정: filterCss 추가 (카운트다운 중에 필터를 바꿔도 찍는 순간의 값을 쓰려고)
    latest.current = { mirrored, ratio: template.cameraRatio, taken, addShot, filterCss: filter.css }
  })

  // 카메라 화면에 들어오면 항상 처음부터 새로 찍기
  useEffect(() => {
    resetShots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    let stream = null

    async function start() {
      setReady(false)
      setError('')
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('no-media-devices')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        // 실제로 켜진 카메라가 전면인지 확인
        const settings = stream.getVideoTracks()[0]?.getSettings?.() ?? {}
        setMirrored(settings.facingMode ? settings.facingMode === 'user' : facing === 'user')
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {}) // 전환이 겹쳐서 play가 끊겨도 무시
        }
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err))
      }
    }
    start()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [facing, attempt])

  // 한 장 찍기: 영상에서 칸 비율로 잘라 context에 저장
  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const now = Date.now()
    if (now - lastShotAt.current < MIN_GAP_MS) return // 방금 찍었으면 무시
    lastShotAt.current = now
    const { mirrored, ratio, taken, addShot, filterCss } = latest.current // [지은] 수정: filterCss 추가
    addShot(captureFromVideo(video, ratio, mirrored, filterCss)) // [지은] 수정: 필터 전달
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    if (taken + 1 >= TOTAL_SHOTS) setFinished(true)
  }, [])

  // 카운트다운: 1초마다 숫자를 줄이다가 1이 지나면 촬영
  useEffect(() => {
    if (count == null) return
    const timer = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1)
      } else {
        capture()
        setCount(null)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [count, capture])

  // 6컷을 다 찍으면 잠깐 안내를 보여주고 사진 선택 화면으로 이동
  useEffect(() => {
    if (!finished) return
    const timer = setTimeout(() => navigate('/select'), AUTO_NEXT_MS)
    return () => clearTimeout(timer)
  }, [finished, navigate])

  const canShoot = ready && count == null && !finished
  // 셔터: 타이머가 켜져 있으면 카운트다운 시작, 꺼져 있으면 바로 촬영
  const shoot = () => {
    if (!canShoot) return
    if (timerOn) setCount(COUNTDOWN_START)
    else capture()
  }
  // 타이머 켬/끔
  const toggleTimer = () => {
    if (count != null) return
    const next = !timerOn
    setTimerOn(next)
    try {
      localStorage.setItem(TIMER_KEY, next ? 'on' : 'off')
    } catch {
      // 저장이 막힌 브라우저(시크릿 모드 등)에서는 이번 접속에서만
    }
  }
  const flip = () => {
    if (count != null || finished) return // 촬영 중에는 전환x
    setFacing((f) => (f === 'user' ? 'environment' : 'user'))
  }

  const shotNumber = Math.min(taken + 1, TOTAL_SHOTS)
  const hint =
    template.cameraRatio === 1
      ? '정사각형으로 찍혀요'
      : template.orientation === 'landscape'
      ? '폰을 가로로 돌려 찍어요'
      : '세로로 찍혀요'

  return (
    <div className="screen camera">
      <header className="cam-header">
        <Link to="/template" className="cam-back">◁ 이전</Link>
        <span className="cam-title">{shotNumber} / {TOTAL_SHOTS} 컷</span>
        <button className="cam-flip" onClick={flip} aria-label="전면과 후면 카메라 전환">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 7h-8a4 4 0 0 0-4 4v1" />
            <path d="M17 4l3 3-3 3" />
            <path d="M4 17h12a4 4 0 0 0 4-4v-1" />
            <path d="M7 20l-3-3 3-3" />
          </svg>
        </button>
      </header>

      {/* 미리보기 상자: 비율(--ratio)이 템플릿의 cameraRatio와 같아서 보이는 그대로 찍힘 */}
      <div className="cam-stage-wrap">
        <div className="cam-stage" style={{ '--ratio': template.cameraRatio }}>
          <video
            ref={videoRef}
            className={`cam-video${mirrored ? ' is-mirrored' : ''}`}
            style={{ filter: filter.css }}
            autoPlay
            playsInline
            muted
            onPlaying={() => setReady(true)}
          />
          <span className="cam-chip cam-chip-top">{facing === 'user' ? '전면 카메라' : '후면 카메라'}</span>
          <span className="cam-chip cam-chip-bottom">{hint}</span>

          {/* [지은] 수정: 촬영 완료 시 알림창과 겹치지 않게 필터 선택 줄 숨기기 */}
          {!finished && (
            <FilterBar value={filterId} onChange={setFilterId} disabled={count != null} />
          )}

          {count != null && <div className="cam-count" aria-live="assertive">{count}</div>}
          {flash && <div className="cam-flash" />}

          {error && (
            <div className="cam-overlay" role="alert">
              <p>{error}</p>
              <button className="cam-overlay-btn" onClick={() => setAttempt((n) => n + 1)}>다시 시도</button>
            </div>
          )}
          {finished && (
            <div className="cam-overlay">
              <strong className="cam-done">{TOTAL_SHOTS}컷 촬영 완료!</strong>
              <p>잠시 후 사진 선택 화면으로 넘어가요</p>
              <Link to="/select" className="cam-overlay-btn">사진 고르러 가기</Link>
            </div>
          )}
        </div>
      </div>

      <div className="cam-dots" aria-hidden="true">
        {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
          <span key={i} className={`cam-dot${i < taken ? ' is-filled' : ''}`} />
        ))}
      </div>

      <div className="cam-shutter-row">
        {/* 타이머 켬/끔: 켜면 "3초", 끄면 "끔" */}
        <button
          className={`cam-timer${timerOn ? ' is-on' : ''}`}
          onClick={toggleTimer}
          disabled={count != null}
          aria-pressed={timerOn}
          aria-label={timerOn ? `타이머 켜짐 ${COUNTDOWN_START}초, 누르면 끄기` : '타이머 꺼짐, 누르면 켜기'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5" />
            <path d="M9.5 2h5" />
            {!timerOn && <path d="M4 4l16 16" />}
          </svg>
          <span>{timerOn ? `${COUNTDOWN_START}초` : '끔'}</span>
        </button>
        <button
          className="cam-shutter"
          onClick={shoot}
          disabled={!canShoot}
          aria-label={timerOn ? `사진 찍기, ${COUNTDOWN_START}초 카운트다운 후 촬영` : '사진 찍기, 바로 촬영'}
        >
          <span />
        </button>
      </div>
    </div>
  )
}