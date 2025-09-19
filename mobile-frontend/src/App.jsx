import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <div className="mobile-app">
      <header className="topbar">
        <h1>PropEstateAI</h1>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        <Link to="/">Home</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/gallery">Gallery</Link>
      </nav>
    </div>
  )
}
