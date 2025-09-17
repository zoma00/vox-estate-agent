import React from 'react';

const backgroundImg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

const propertyImages = [
  // Placeholder images (Unsplash or local)
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80',
];

export default function AdminDashboard() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: `url(${backgroundImg}) center/cover no-repeat`,
      position: 'relative'
    }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'rgba(44,62,80,0.95)', color: '#fff', padding: '32px 0', minHeight: '100vh' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
          <button style={{ background: 'none', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>Dashboard</button>
          <button style={{ background: 'none', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>Properties</button>
          <button style={{ background: 'none', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>Users</button>
          <button style={{ background: 'none', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>Settings</button>
        </nav>
        <button
          onClick={() => window.location.href = '/'}
          style={{ marginTop: 48, background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: 16 }}
        >
          Back to Home
        </button>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 48px', background: 'rgba(255,255,255,0.85)', borderRadius: 16, margin: 32 }}>
        <h1 style={{ marginBottom: 32, color: '#2c3e50' }}>Dashboard Overview</h1>
        {/* Property Gallery */}
        <section>
          <h2 style={{ marginBottom: 16 }}>Property Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {propertyImages.map((img, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', overflow: 'hidden', textAlign: 'center' }}>
                <img src={img} alt={`Property ${idx + 1}`} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: '12px 0' }}>Property {idx + 1}</div>
              </div>
            ))}
          </div>
        </section>
          {/* Realestate Links Section */}
          <section style={{ marginTop: 40 }}>
            <h2 style={{ marginBottom: 16 }}>Realestate Links</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="https://www.propertyfinder.eg/" target="_blank" rel="noopener noreferrer">Property Finder Egypt</a></li>
              <li><a href="https://www.olx.com.eg/en/properties/" target="_blank" rel="noopener noreferrer">OLX Egypt Properties</a></li>
              <li><a href="https://www.aqarmap.com.eg/en" target="_blank" rel="noopener noreferrer">Aqarmap</a></li>
              <li><a href="https://www.egyptrealestatehub.com/" target="_blank" rel="noopener noreferrer">Egypt Real Estate Hub</a></li>
              <li><a href="https://www.nawy.com/en" target="_blank" rel="noopener noreferrer">Nawy</a></li>
              <li><a href="https://www.coldwellbanker-eg.com/" target="_blank" rel="noopener noreferrer">Coldwell Banker Egypt</a></li>
              <li><a href="https://www.remax.com.eg/" target="_blank" rel="noopener noreferrer">RE/MAX Egypt</a></li>
            </ul>
          </section>
      </main>
    </div>
  );
}
