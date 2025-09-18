// Track user interactions with real estate platforms
const trackPlatformInteraction = (platformName, action = 'view') => {
  if (process.env.NODE_ENV === 'production') {
    // Replace with your analytics service (e.g., Google Analytics, Mixpanel)
    console.log(`[Analytics] Platform ${action}:`, platformName);
    
    // Example: Send to analytics service
    // window.gtag('event', 'platform_interaction', {
    //   event_category: 'real_estate',
    //   event_label: platformName,
    //   value: action
    // });
  }
};

// Track performance metrics
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);

      // Track platform clicks
      document.addEventListener('click', (e) => {
        // Track platform card clicks
        const platformCard = e.target.closest('.platform-card');
        if (platformCard) {
          const platformName = platformCard.querySelector('h3')?.textContent || 'Unknown Platform';
          trackPlatformInteraction(platformName, 'click');
        }

        // Track external link clicks
        const externalLink = e.target.closest('a[target="_blank"]');
        if (externalLink && externalLink.href) {
          const platformName = externalLink.closest('.platform-card')?.querySelector('h3')?.textContent || 
                             new URL(externalLink.href).hostname;
          trackPlatformInteraction(platformName, 'external_visit');
        }
      });

      // Track property views when properties are loaded
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length && document.querySelector('.properties-preview')) {
            const platformName = document.querySelector('.properties-preview h3')?.textContent.replace('Properties from ', '') || 'Unknown';
            trackPlatformInteraction(platformName, 'property_view');
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
};

export { reportWebVitals, trackPlatformInteraction };
