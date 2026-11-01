// [지은] 6. 앱 갤러리 - 저장한 사진 모아보기 (날짜별 달력 뷰 + 즐겨찾기)
//   - 나중 단계: utils/storage.js (IndexedDB)로 저장/불러오기
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as storage from '../utils/storage.js'
import './Gallery.css'

const canLoad = typeof storage.loadGallery === 'function'

export default function Gallery() {
  const [items, setItems] = useState(canLoad ? null : []) // null이면 불러오는 중

  const fetchItems = () => {
    if (!canLoad) return
    storage.loadGallery()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // [지은] 하트 버튼 클릭 시 즐겨찾기 토글 후 목록 새로고침
  const handleToggleFavorite = async (id) => {
    if (typeof storage.toggleFavorite === 'function') {
      await storage.toggleFavorite(id)
      fetchItems() // 상태 변경 후 목록 다시 불러오기
    }
  }

  // [지은] createdAt 기준으로 데이터를 YYYY-MM-DD 문자열로 그룹화
  const groupedItems = (items || []).reduce((acc, item) => {
    // createdAt 타임스탬프를 YYYY-MM-DD 형식으로 변환
    const d = new Date(item.createdAt)
    const p = (n) => String(n).padStart(2, '0')
    const dateKey = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
    
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {})

  return (
    <div className="screen gallery">
      {/* 헤더: 뒤로가기 + 제목 */}
      <header className="gallery-header">
        <Link to="/" className="btn gallery-back" aria-label="홈으로">◁</Link>
        <h2>내 갤러리</h2>
      </header>
      <p className="gallery-sub">이 브라우저에 저장된 사진만 보여요</p>

      {/* 불러오는 중 / 비어 있음 / 날짜별 달력 뷰 */}
      {items === null ? (
        <p className="gallery-empty">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="gallery-empty">아직 저장된 사진이 없어요</p>
      ) : (
        <div className="gallery-calendar">
          {Object.entries(groupedItems).map(([dateKey, photos]) => (
            <div key={dateKey} className="gallery-date-section">
              {/* 날짜 헤더 */}
              <h3 className="gallery-date-header" style={{ borderBottom: '2px solid var(--color-ink)', paddingBottom: '4px', marginBottom: '12px' }}>
                {dateKey}
              </h3>
              
              {/* 해당 날짜의 사진 그리드 */}
              <ul className="gallery-grid">
                {photos.map((item) => (
                  <li key={item.id ?? item.url} className="gallery-item" style={{ position: 'relative' }}>
                    <img src={item.url} alt={`${item.date ?? ''} 네 컷 사진`} />
                    <span>{item.date}</span>
                    
                    {/* 즐겨찾기 버튼 */}
                    <button 
                      onClick={() => handleToggleFavorite(item.id)}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '20px', textShadow: '0 0 2px rgba(0,0,0,0.5)'
                      }}
                      aria-label="즐겨찾기 토글"
                    >
                      {item.isFavorite ? '❤️' : '🤍'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Link to="/template" className="btn btn-primary gallery-new">새로 찍기</Link>
    </div>
  )
}