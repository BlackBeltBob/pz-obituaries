import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ObituaryDetail } from './components/ObituaryDetail'
import { ObituaryList } from './components/ObituaryList'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ObituaryList />} />
          <Route path="/:slug" element={<ObituaryDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
