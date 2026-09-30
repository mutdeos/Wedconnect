import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Intro from './components/Intro'
import { shouldPlayIntro } from './components/introStorage'
import Layout from './components/Layout'
import { StoreProvider } from './store/StoreProvider'
import Booking from './pages/Booking'
import Community from './pages/Community'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import VendorProfile from './pages/VendorProfile'
import Vendors from './pages/Vendors'

export default function App() {
  const [showIntro, setShowIntro] = useState(shouldPlayIntro)

  return (
    <StoreProvider>
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/:id" element={<VendorProfile />} />
            <Route path="book/:id" element={<Booking />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
