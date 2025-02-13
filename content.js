let isFullscreen = !window.screenTop && !window.screenY;
let searchPopup = null;
let searchInput = null;

// Add listener to document when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeListeners);
} else {
  initializeListeners();
}

function initializeListeners() {
  
  // Fullscreen change listener
  window.addEventListener('resize', () => {
    isFullscreen = !window.screenTop && !window.screenY
  });

  // Global keyboard listener
  document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  
  if (isFullscreen && e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    showSearchPopup();
  }
  
  if (searchPopup && e.key === 'Escape') {
    hideSearchPopup();
  }
}

function showSearchPopup() {
  if (searchPopup) return;
  
  searchPopup = document.createElement('div');
  searchPopup.style.cssText = `
   width: 60vw;
   position: fixed;
   z-index: 999999;
   top: 0;
   left: calc(50% - 30vw);
   border-radius: 6px;
   backdrop-filter: invert(0.75);
   padding: 1rem;
   display: flex;
 `;
  
  searchInput = document.createElement('input');
  searchInput.value = window.location.href
  
  searchInput.placeholder = 'Enter URL or search term';
  searchInput.value = window.location.href;
  searchInput.style.cssText = `
    width: 100%;
    padding: 1rem;
    border-radius: 6px;
    border: none;
    font-size: 1rem;
    background: #333;
    color: #fff;
   > &:focus {
     border: none;
     outline: none;
   }
 `;
  searchInput.addEventListener('blur', hideSearchPopup);
  searchInput.addEventListener('focus', () => searchInput.select());
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = searchInput.value.trim();
      
      if (isValidUrl(value)) {
        // If valid URL, go directly to the site
        const url = value.startsWith('http') ? value : `https://${value}`;
        window.location.href = url;
      } else {
        // Otherwise, search on Google
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
      }
      
      hideSearchPopup();
    }
  });
  
  searchPopup.appendChild(searchInput);
  document.body.appendChild(searchPopup);
  searchInput.focus();
}

function hideSearchPopup() {
  if (searchPopup) {
    searchPopup.remove();
    searchPopup = null;
    searchInput = null;
  }
}

function isValidUrl(string) {
  // List of common top-level domains
  const commonTLDs = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'io', 'co',
    'ai', 'app', 'dev', 'blog', 'me', 'info', 'biz', 'eu',
    'uk', 'de', 'fr', 'jp', 'cn', 'au', 'ca', 'br', 'in'
  ];

  // Remove any protocol prefix for checking
  let urlToCheck = string.toLowerCase();
  urlToCheck = urlToCheck.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Check if it's an IP address
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipPattern.test(urlToCheck)) {
    const parts = urlToCheck.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Check if it has at least one dot and no spaces
  if (!urlToCheck.includes('.') || urlToCheck.includes(' ')) {
    return false;
  }

  // Get the top-level domain
  const parts = urlToCheck.split('.');
  const tld = parts[parts.length - 1];

  // Domain should have at least two parts (something.com)
  // and the TLD should be in our list or be a country code (2 chars)
  return parts.length >= 2 && (
    commonTLDs.includes(tld) ||
    (tld.length === 2 && /^[a-z]{2}$/.test(tld))
  );
}

