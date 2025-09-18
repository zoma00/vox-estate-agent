// src/services/realEstateApi.js
import { REAL_ESTATE_LINKS } from '../constants/realEstateLinks';

// Mock data for properties
const MOCK_PROPERTIES = Array.from({ length: 10 }, (_, i) => {
  const location = i % 2 ? 'Dubai Marina' : 'Palm Jumeirah';
  const region = 'UAE';
  const propertyType = i % 2 ? 'Apartment' : 'Villa';
  
  // Get a random platform from REAL_ESTATE_LINKS that matches the region
  const platforms = REAL_ESTATE_LINKS.filter(platform => 
    platform.region === region
  );
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)] || {};
  
  return {
    id: `prop-${i + 1}`,
    title: `Beautiful ${propertyType} in ${location}`,
    price: `${(Math.random() * 5000000 + 500000).toLocaleString('en-US', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    })}`,
    coverPhoto: {
      url: `https://source.unsplash.com/random/400x300?real-estate-${i}`
    },
    location: [
      { name: location },
      { name: region }
    ],
    area: Math.floor(1000 + Math.random() * 3000),
    rooms: Math.floor(1 + Math.random() * 5),
    baths: Math.floor(1 + Math.random() * 4),
    website: randomPlatform.url || '#',
    hasApi: randomPlatform.hasApi || false
  };
});

// Mock API function
export const fetchProperties = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data with pagination
  const page = params.page || 1;
  const perPage = params.hitsPerPage || 10;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    hits: MOCK_PROPERTIES.slice(start, end),
    total: MOCK_PROPERTIES.length,
    page,
    totalPages: Math.ceil(MOCK_PROPERTIES.length / perPage)
  };
};