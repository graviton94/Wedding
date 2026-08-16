import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.jsx'

// 스튜디오는 하객이 보는 청첩장과 무관한 제작 도구라 지연 로딩한다
// (초기 번들에 캔버스 엔진과 편집 UI가 섞이지 않게)
const VideoStudio = lazy(() => import('./video/studio/VideoStudio.jsx'))

/**
 * 해시 기반 라우팅.
 * GitHub Pages는 SPA 폴백이 없어 /studio 같은 경로는 404가 난다. #/studio 는 항상 동작한다.
 */
const useHashRoute = () => {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

const Root = () => {
  const hash = useHashRoute()

  if (hash.startsWith('#/studio')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
        <VideoStudio />
      </Suspense>
    )
  }
  return <App />
}

export default Root
