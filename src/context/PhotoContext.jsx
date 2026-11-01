// [담당: 원영] 화면이 바뀌어도 유지되는 공유 데이터
// 다른 파일에서 가져다쓰기 -> const { templateId, shots, addShot } = usePhoto()
import { createContext, useContext, useState } from 'react'
import { TEMPLATES, TOTAL_SHOTS } from '../constants/templates.js'

const PhotoContext = createContext(null)

const emptyShots = () => Array(TOTAL_SHOTS).fill(null)
const emptySlots = () => Array(4).fill(null)
const zeroRotations = () => Array(TOTAL_SHOTS).fill(0)

export function PhotoProvider({ children }) {
  const [templateId, setTemplateId] = useState('basic')
  const [shots, setShots] = useState(emptyShots)            // 찍은 사진 6장 (이미지 주소, 안 찍었으면 null)
  const [slots, setSlots] = useState(emptySlots)            // 프레임 4칸에 들어간 사진 번호 (shots의 index, 빈 칸은 null)
  const [rotations, setRotations] = useState(zeroRotations) // 사진별 회전 각도 (90씩 증가)
  const [frameColor, setFrameColor] = useState('#1B1A22')
  const [frameStyle, setFrameStyle] = useState('solid')     // [지은] 프레임 패턴 스타일 상태 추가
  const [resultUrl, setResultUrl] = useState(null)          // 합성이 끝난 최종 이미지

  const template = TEMPLATES[templateId]

  // 템플릿을 바꾸면 찍은 사진과 선택 상태를 모두 초기화
  const selectTemplate = (id) => {
    setTemplateId(id)
    resetShots()
  }

  // 촬영 후 다음 빈 컷에 사진 추가 (6장 다 찼으면 아무것도 안 함)
  // setShots에 함수를 넘기면 "가장 최신 shots(prev)"를 받기
  const addShot = (url) => {
    setShots((prev) => {
      const at = prev.indexOf(null)
      if (at === -1) return prev
      const next = prev.slice()
      next[at] = url
      return next
    })
  }

  // 재촬영: 사진, 선택, 회전 전부 초기화
  const resetShots = () => {
    setShots(emptyShots())
    setSlots(emptySlots())
    setRotations(zeroRotations())
    setResultUrl(null)
  }

  // 사진 선택 화면: shotIndex번 사진을 첫 번째 빈 칸에 넣기
  const placePhoto = (shotIndex) => {
    if (slots.includes(shotIndex)) return false
    const at = slots.indexOf(null)
    if (at === -1) return false
    const next = slots.slice()
    next[at] = shotIndex
    setSlots(next)
    return true
  }

  // 프레임의 slotIndex번 칸 사진 빼기
  const removeFromSlot = (slotIndex) => {
    const next = slots.slice()
    next[slotIndex] = null
    setSlots(next)
  }

  // 사진 회전 (delta: 90 또는 -90)
  const rotateShot = (shotIndex, delta) => {
    const next = rotations.slice()
    next[shotIndex] += delta
    setRotations(next)
  }

  // 홈으로 돌아갈 때 전체 초기화
  const resetAll = () => {
    setTemplateId('basic')
    setFrameColor('#1B1A22')
    setFrameStyle('solid') // [지은] 패턴 초기화 추가
    resetShots()
  }

  const value = {
    template, templateId, shots, slots, rotations, frameColor, frameStyle, resultUrl,
    selectTemplate, addShot, resetShots, placePhoto, removeFromSlot,
    rotateShot, setFrameColor, setFrameStyle, setResultUrl, resetAll,
  }

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>
}

export function usePhoto() {
  const ctx = useContext(PhotoContext)
  if (!ctx) throw new Error('usePhoto는 PhotoProvider 안에서만 쓸 수 있어요')
  return ctx
}