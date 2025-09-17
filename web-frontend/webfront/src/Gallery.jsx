import { REAL_ESTATE_LINKS } from './constants/realEstateLinks';

const propertyImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80',
];

function Gallery() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: 32 }}>Property Gallery</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 40 }}>
        {propertyImages.map((img, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', overflow: 'hidden', textAlign: 'center' }}>
            <img src={img} alt={`Property ${idx + 1}`} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
            <div style={{ padding: '12px 0' }}>Property {idx + 1}</div>
          </div>
        ))}
      </div>
      <section>
        <h2 style={{ marginBottom: 16 }}>Real Estate Links</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {REAL_ESTATE_LINKS.map((link, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#2c3e50',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#f5f7fa',
                    color: '#1a73e8',
                  },
                }}
              >
                <span style={{ marginRight: '8px' }}>🔗</span>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Gallery;
