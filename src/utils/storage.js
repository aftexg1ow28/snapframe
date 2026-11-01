// [담당: 원영] 앱 안 갤러리 저장 (브라우저의 IndexedDB 사용).
//   - 이 브라우저(이 기기)에만 저장
//   - 설치 없이 브라우저 기본 기능만
//
//   saveToGallery(url) : 완성된 사진(dataURL)을 저장하고 { id, url, date, isFavorite } 를 돌려줌
//   loadGallery()      : 저장된 사진 목록 [{ id, url, date, isFavorite }] (최근에 저장한 게 먼저)
//   removeFromGallery(id) : 한 장 지우기
//   toggleFavorite(id) : [지은] 즐겨찾기 상태 반전

const DB_NAME = 'snapframe'
const STORE = 'gallery'

// 데이터베이스 열기 (처음이면 "gallery" 보관함)
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// 보관함에서 작업 하나 하고, 모두 끝날 때까지 기다리기 (work가 돌려준 요청의 결과를 반환)
async function withStore(mode, work) {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = work(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req?.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

// 오늘 날짜 'YYYY.MM.DD'
function todayText() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

export async function loadGallery() {
  const list = await withStore('readonly', (store) => store.getAll())
  return (list ?? []).sort((x, y) => y.createdAt - x.createdAt)
}

export async function saveToGallery(url) {
  // 저장하기를 연달아 눌러도 같은 사진이 두 장 생기지 않게 확인
  const existing = (await loadGallery()).find((item) => item.url === url)
  if (existing) return existing
  
  // [지은] isFavorite: false 기본값 추가
  const item = { 
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, 
    url, 
    date: todayText(), 
    createdAt: Date.now(),
    isFavorite: false 
  }
  
  await withStore('readwrite', (store) => store.put(item))
  return item
}

export async function removeFromGallery(id) {
  await withStore('readwrite', (store) => store.delete(id))
}

// [지은] 특정 ID의 사진을 찾아 즐겨찾기 상태를 반전시키고 다시 저장
export async function toggleFavorite(id) {
  return await withStore('readwrite', (store) => {
    const request = store.get(id)
    request.onsuccess = () => {
      const item = request.result
      if (item) {
        item.isFavorite = !item.isFavorite
        store.put(item)
      }
    }
    return request
  })
}