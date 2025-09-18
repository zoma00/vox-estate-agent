// src/components/RealEstatePlatforms.js
import React, { useState, useMemo } from 'react';
import { REAL_ESTATE_LINKS } from '../constants/realEstateLinks';
import { fetchProperties } from '../services/realEstateApi';
import './RealEstatePlatforms.css';

const RealEstatePlatforms = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized values
  const regions = useMemo(() => {
    const regionCounts = REAL_ESTATE_LINKS.reduce((acc, platform) => {
      if (!platform.region) return acc;
      acc[platform.region] = (acc[platform.region] || 0) + 1;
      return acc;
    }, {});
    
    const allRegions = [
      { id: 'all', name: 'All', count: REAL_ESTATE_LINKS.length }
    ];
    
    const uniqueRegions = Object.entries(regionCounts)
      .map(([name, count]) => ({
        id: name.toLowerCase(),
        name,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
      
    return [...allRegions, ...uniqueRegions];
  }, []);

  // Filter platforms based on search term and active tab
  const filteredPlatforms = useMemo(() => {
    if (!REAL_ESTATE_LINKS || !Array.isArray(REAL_ESTATE_LINKS)) {
      console.error('REAL_ESTATE_LINKS is not properly defined');
      return [];
    }
    
    return REAL_ESTATE_LINKS.filter(platform => {
      if (!platform) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        (platform.name && platform.name.toLowerCase().includes(searchLower)) ||
        (platform.keywords && Array.isArray(platform.keywords) && 
         platform.keywords.some(kw => kw && kw.toLowerCase().includes(searchLower)));
      
      const matchesTab = activeTab === 'all' || 
        (platform.region && platform.region === activeTab);
      
      return matchesSearch && matchesTab;
    });
  }, [activeTab, searchTerm]);

  // Rest of the component remains the same...
  // [Previous implementation of handlePlatformClick, handlePageChange, renderPropertyCards]

  // Update the JSX to use safe region display
  // Render platform cards
  const renderPlatforms = () => {
    if (filteredPlatforms.length === 0) {
      return <div className="no-results">No platforms found matching your search.</div>;
    }

    return (
      <div className="platforms-grid">
        {filteredPlatforms.map(platform => (
          <div key={platform.id} className="platform-card">
            <div className="platform-header">
              <h3>{platform.name}</h3>
              {platform.hasApi && <span className="api-badge">API Available</span>}
            </div>
            <div className="region">{platform.region}</div>
            {platform.keywords && platform.keywords.length > 0 && (
              <div className="keywords">
                {platform.keywords.slice(0, 4).map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            )}
            <a 
              href={platform.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="visit-link"
            >
              Visit {platform.name} →
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="real-estate-platforms">
      <h2>Explore Real Estate Platforms</h2>
      
      {/* Search and Filter */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search real estate platforms"
          />
        </div>
        
        <div className="tabs-container">
          <div className="tabs-scroll">
            {regions.map(region => (
              <button
                key={region.id}
                className={`tab ${activeTab === region.id ? 'active' : ''}`}
                onClick={() => setActiveTab(region.id)}
                aria-pressed={activeTab === region.id}
              >
                {region.name}
                <span className="region-count">
                  {region.count} {region.count === 1 ? 'platform' : 'platforms'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      {renderPlatforms()}
    </div>
  );
};

export default RealEstatePlatforms;