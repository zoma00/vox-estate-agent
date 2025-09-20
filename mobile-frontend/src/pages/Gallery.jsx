import React from 'react'

const sampleProperties = [
  {
    id: 1,
    title: 'Beautiful Villa in Palm Jumeirah',
    location: 'Palm Jumeirah, UAE',
    area: '3095 sq.ft',
    beds: 4,
    baths: 1,
    price: '$820,000',
    img: '/assets/real-estate-buildings-in-modern-city-akg75n64dxflm7dk.jpg',
    source: 'dubai.dubizzle.com'
  },
  {
    id: 2,
    title: 'Beautiful Apartment in Dubai Marina',
    location: 'Dubai Marina, UAE',
    area: '3291 sq.ft',
    beds: 5,
    baths: 3,
    price: '$1,020,000',
    img: '/assets/photo-1582407947304-fd86f028f716.avif',
    source: 'dubai.dubizzle.com'
  },
  {
    id: 3,
    title: 'Beautiful Villa in Palm Jumeirah',
    location: 'Palm Jumeirah, UAE',
    area: '3882 sq.ft',
    beds: 4,
    baths: 3,
    price: '$1,450,000',
    img: '/assets/real-estate-buildings-in-modern-city-akg75n64dxflm7dk.jpg',
    source: 'propertyfinder.ae'
  },
  {
    id: 4,
    title: 'Beautiful Apartment in Dubai Marina',
    location: 'Dubai Marina, UAE',
    area: '1742 sq.ft',
    beds: 2,
    baths: 2,
    price: '$610,000',
    img: '/assets/photo-1582407947304-fd86f028f716.avif',
    source: 'bayut.com'
  }
]

function PropertyCard({ p }){
  const onImgError = (e) => {
    e.currentTarget.src = '/assets/photo-1582407947304-fd86f028f716.avif'
  }

  return (
    <article className="prop-card card" aria-labelledby={`prop-${p.id}-title`}>
      <div className="prop-thumb">
        <img src={p.img} alt={p.title} loading="lazy" onError={onImgError} />
      </div>

      <div className="prop-content">
        <h3 id={`prop-${p.id}-title`}>{p.title}</h3>
        <div className="prop-location">📍 {p.location}</div>
        <div className="prop-badges">
          <span className="badge">{p.area}</span>
          <span className="badge">{p.beds} beds</span>
          <span className="badge">{p.baths} baths</span>
        </div>

        <div className="prop-actions">
          <button className="btn">View Details</button>
          <a className="link-btn" href={`https://${p.source}`} target="_blank" rel="noreferrer">{p.source}</a>
        </div>
      </div>
    </article>
  )
}

export default function Gallery(){
  return (
    <div>
      <div className="properties-hero hero-bg">
        <div className="hero-overlay">
          <div className="hero-card">
            <h1 className="featured-heading">Featured Properties</h1>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="properties-grid">
          {sampleProperties.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  )
}
