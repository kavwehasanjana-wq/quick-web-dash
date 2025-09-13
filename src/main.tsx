import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Index from './pages/Index.tsx'
import { Login } from './pages/Login.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)
