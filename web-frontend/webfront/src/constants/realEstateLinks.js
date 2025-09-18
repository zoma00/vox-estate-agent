// src/constants/realEstateLinks.js
export const REAL_ESTATE_LINKS = [
  // UAE Platforms
  {
    id: 'bayut',
    name: "Bayut",
    url: "https://www.bayut.com/",
    region: "UAE",
    hasApi: true,
    defaultLocation: 'dubai',
    keywords: ["bayut", "dubai", "uae", "real estate", "properties"]
  },
  {
    id: 'dubizzle',
    name: "Dubizzle",
    url: "https://dubai.dubizzle.com/property-for-sale/",
    region: "UAE",
    hasApi: false,
    keywords: ["dubizzle", "dubai", "classifieds", "properties"]
  },
  {
    id: 'propertyfinder-ae',
    name: "Property Finder UAE",
    url: "https://www.propertyfinder.ae/",
    region: "UAE",
    hasApi: true,
    keywords: ["property finder", "uae", "dubai", "abu dhabi", "real estate"]
  },
  // Egypt Platforms
  {
    id: 'property-finder-eg',
    name: "Property Finder Egypt",
    url: "https://www.propertyfinder.eg/",
    region: "Egypt",
    hasApi: true,
    defaultLocation: 'cairo',
    keywords: ["property finder", "egypt", "cairo", "real estate"]
  },
  {
    id: 'aqarmap',
    name: "Aqarmap",
    url: "https://aqarmap.com.eg/en/",
    region: "Egypt",
    hasApi: true,
    defaultLocation: 'cairo',
    keywords: ["aqarmap", "egypt", "cairo", "alexandria", "real estate"]
  },
  {
    id: 'nawy',
    name: "Nawy",
    url: "https://www.nawy.com.eg/",
    region: "Egypt",
    hasApi: true,
    keywords: ["nawy", "egypt", "cairo", "real estate", "properties for sale"]
  },
  // USA Platforms
  {
    id: 'zillow',
    name: "Zillow",
    url: "https://www.zillow.com/",
    region: "USA",
    hasApi: true,
    keywords: ["zillow", "usa", "real estate", "homes", "apartments"]
  },
  {
    id: 'realtor',
    name: "Realtor.com",
    url: "https://www.realtor.com/",
    region: "USA",
    hasApi: true,
    keywords: ["realtor", "usa", "real estate", "homes for sale", "rentals"]
  },
  {
    id: 'redfin',
    name: "Redfin",
    url: "https://www.redfin.com/",
    region: "USA",
    hasApi: true,
    keywords: ["redfin", "usa", "real estate", "homes", "buying"]
  },
  {
    id: 'trulia',
    name: "Trulia",
    url: "https://www.trulia.com/",
    region: "USA",
    hasApi: true,
    keywords: ["trulia", "usa", "homes for sale", "rentals", "neighborhoods"]
  }
].map(platform => ({
  // Set default values for all required fields
  hasApi: false,
  defaultLocation: 'global',
  keywords: [],
  ...platform
}));