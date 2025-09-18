import React, { useState, useEffect } from 'react';
import { fetchProperties } from './services/realEstateApi';
import { REAL_ESTATE_LINKS } from './constants/realEstateLinks';
import './Gallery.css';

function Gallery() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const result = await fetchProperties({ page, hitsPerPage: 9 });
        setProperties(result.hits);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Featured Properties</h1>
      
      <div className="properties-grid">
        {properties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="property-image" style={{ backgroundImage: `url(${property.coverPhoto.url})` }}>
              <div className="property-price">{property.price}</div>
            </div>
            <div className="property-details">
              <h3 className="property-title">{property.title}</h3>
              <div className="property-location">
                {property.location.map((loc, idx) => (
                  <span key={idx}>{loc.name}{idx < property.location.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
              <div className="property-features">
                <span>🏠 {property.area} sq.ft</span>
                <span>🛏️ {property.rooms} beds</span>
                <span>🚿 {property.baths} baths</span>
              </div>
              <div className="property-actions">
                <button className="btn view-details-btn">View Details</button>
                {property.website && (
                  <a 
                    href={property.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn visit-website-btn"
                  >
                    Visit Website
                  </a>
                )}
                {property.hasApi && (
                  <span className="api-indicator" title="API Available">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    API
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={handlePrevPage} 
          disabled={page === 1}
          className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
        >
          Previous
        </button>
        <span className="page-indicator">Page {page} of {totalPages}</span>
        <button 
          onClick={handleNextPage} 
          disabled={page === totalPages}
          className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Gallery;
