import { REAL_ESTATE_LINKS } from '../constants/realEstateLinks';

export const findMatchingLink = (text) => {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // First, check for direct URL matches
  const directMatch = REAL_ESTATE_LINKS.find(link => 
    lowerText.includes(link.url.toLowerCase()) ||
    lowerText.includes(link.name.toLowerCase())
  );
  
  if (directMatch) return directMatch;
  
  // Then check for keyword matches
  const keywordMatch = REAL_ESTATE_LINKS.find(link => 
    link.keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )
  );
  
  return keywordMatch || null;
};

export const extractLinksFromText = (text) => {
  if (!text) return [];
  
  // Find all URLs in the text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  
  // Find all mentioned real estate services
  const mentionedLinks = REAL_ESTATE_LINKS.filter(link => 
    text.toLowerCase().includes(link.name.toLowerCase())
  );
  
  // Combine and deduplicate
  const allLinks = [
    ...urls.map(url => ({ url, name: url })),
    ...mentionedLinks
  ];
  
  return Array.from(new Map(allLinks.map(link => [link.url, link])).values());
};

export const formatMessageWithLinks = (text) => {
  if (!text) return text;
  
  // Replace URLs with clickable links
  let formattedText = text.replace(
    /(https?:\/\/[^\s]+)/g, 
    url => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: none;">${url}</a>`
  );
  
  // Replace known link names with clickable links
  REAL_ESTATE_LINKS.forEach(link => {
    const regex = new RegExp(link.name, 'gi');
    formattedText = formattedText.replace(
      regex,
      `<a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: none; font-weight: 500;">${link.name}</a>`
    );
  });
  
  return formattedText;
};
