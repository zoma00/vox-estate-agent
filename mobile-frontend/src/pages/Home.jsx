import React from 'react'

export default function Home(){
  return (
    <div className="home-hero hero-bg">
      <div className="hero-overlay">
        <div className="hero-card">
          <h1>Welcome to PropEstateAI</h1>
       <p className="muted">A demo mobile UI — chat with the agent, get spoken responses, explore listings.</p>
          <a className="hero-cta" href="/gallery">View Gallery</a>
        </div>
      </div>
    </div>
  )
}
