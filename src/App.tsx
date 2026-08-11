import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ObituaryDetail } from './components/ObituaryDetail'
import { ObituaryList } from './components/ObituaryList'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950">
        <Routes>
          <Route path="/" element={<ObituaryList />} />
          <Route path="/:slug" element={<ObituaryDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
