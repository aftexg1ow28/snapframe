// [지은] 6. 앱 갤러리 - 저장한 사진 모아보기 (날짜별 달력 뷰 + 즐겨찾기 + 크게 보기)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as storage from '../utils/storage.js'
import './Gallery.css'

const canLoad = typeof storage.loadGallery === 'function'

export default function Gallery() {
  const [items, setItems] = useState(canLoad ? null : []) // null이면 불러오는 중
  const [selectedItem, setSelectedItem] = useState(null) // [지은] 사진 크게 보기용 상태

  const fetchItems = () => {
    if (!canLoad) return
    storage.loadGallery()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // 즐겨찾기 토글
  const handleToggleFavorite = async (id) => {
    if (typeof storage.toggleFavorite === 'function') {
      await storage.toggleFavorite(id)
      fetchItems()
    }
  }

  // [지은] 사진 삭제 기능
  const handleDelete = async (id) => {
    if (window.confirm('이 사진을 갤러리에서 지울까요?')) {
      await storage.removeFromGallery(id)
      setSelectedItem(null) // 삭제 후 모달 닫기
      fetchItems() // 목록 새로고침
    }
  }

  // [지은] 기기에 다시 다운로드
  const handleDownload = (url, id) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `snapframe-${id}.png` // 기본 파일명
    a.click()
  }

  const groupedItems = (items || []).reduce((acc, item) => {
    const d = new Date(item.createdAt)
    const p = (n) => String(n).padStart(2, '0')
    const dateKey = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
    
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {})

  return (
    <div className="screen gallery">
      <header className="gallery-header">
        <Link to="/" className="btn gallery-back" aria-label="홈으로">◁</Link>
        <h2>내 갤러리</h2>
      </header>
      <p className="gallery-sub">이 브라우저에 저장된 사진만 보여요</p>

      {items === null ? (
        <p className="gallery-empty">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="gallery-empty">아직 저장된 사진이 없어요</p>
      ) : (
        <div className="gallery-calendar">
          {Object.entries(groupedItems).map(([dateKey, photos]) => (
            <div key={dateKey} className="gallery-date-section">
              <h3 className="gallery-date-header" style={{ borderBottom: '2px solid var(--color-ink)', paddingBottom: '4px', marginBottom: '12px' }}>
                {dateKey}
              </h3>
              
              <ul className="gallery-grid">
                {photos.map((item) => (
                  <li key={item.id ?? item.url} className="gallery-item" style={{ position: 'relative' }}>
                    {/* [지은] 사진 클릭 시 selectedItem에 담아 크게 보기 띄움 */}
                    <img 
                      src={item.url} 
                      alt={`${item.date ?? ''} 네 컷 사진`} 
                      onClick={() => setSelectedItem(item)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{item.date}</span>
                    
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

      {/* [지은] 크게 보기(모달) 영역 */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          {/* 닫기 버튼을 바깥 배경 클릭으로도 닫을 수 있게 처리 */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setSelectedItem(null)} />
          
          <img 
            src={selectedItem.url} 
            alt="크게 보기" 
            style={{ 
              maxWidth: '100%', maxHeight: '70vh', 
              borderRadius: '8px', zIndex: 10000, 
              border: '3px solid var(--color-ink)',
              boxShadow: '6px 6px 0 var(--color-brand)' 
            }} 
          />
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', zIndex: 10000 }}>
            <button onClick={() => handleDownload(selectedItem.url, selectedItem.id)} className="btn btn-primary">
              ↓ 다운로드
            </button>
            <button onClick={() => handleDelete(selectedItem.id)} className="btn" style={{ backgroundColor: '#FF5B5B', color: '#fff' }}>
              삭제
            </button>
            <button onClick={() => setSelectedItem(null)} className="btn">
              닫기
            </button>
          </div>
        </div>
      )}

      <Link to="/template" className="btn btn-primary gallery-new">새로 찍기</Link>
    </div>
  )
}