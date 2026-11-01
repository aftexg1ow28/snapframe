// [지은] 1. 홈 – 포토부스 연출 (커튼이 열리고, 슬롯에서 스트립이 나와요)
// [지은] 수정 (11/01): 2차 리뉴얼. 화면 이동(Link)은 그대로
// [지은] 수정 (11/01): 설명 문구와 스티커를 빼고 한 줄 소개만 남김
import { Link } from 'react-router-dom'
import frameImg from '../assets/home-frame.png'
import './Home.css'

// 전광판 문구: 같은 줄을 두 번 이어 붙여서 끊김 없이 반복해요
const TICKER = 'SMILE ★ SNAP ★ PRINT ★ '.repeat(6)

export default function Home() {
  return (
    <div className="home">
      {/* 부스 커튼 (열리는 연출용, 클릭을 막지 않아요) */}
      <div className="home-curtain" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="home-ticker" aria-hidden="true">
        <div className="home-ticker-track">
          <span>{TICKER}</span>
          <span>{TICKER}</span>
        </div>
      </div>

      <div className="home-top">
        <h1 className="home-logo">SnapFrame</h1>
        <span className="home-open"><i />OPEN</span>
      </div>

      <h2 className="home-title">
        네 컷을<br />
        <mark>바로 찍자</mark>
      </h2>
      <p className="home-desc">오늘의 얼굴, <b>CATCH ON!</b></p>

      <div className="home-hero">
        <div className="home-slot" aria-hidden="true" />
        <div className="home-frame-wrap">
          <img className="home-frame" src={frameImg} alt="네 컷 사진 프레임 예시" />
        </div>
      </div>

      <div className="home-buttons">
        <Link to="/template" className="btn btn-primary btn-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          사진 찍기
        </Link>
        <Link to="/gallery" className="btn btn-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          갤러리
        </Link>
      </div>
      <p className="home-note">사진은 서버로 전송되지 않고 내 기기에서만 처리돼요</p>
    </div>
  )
}