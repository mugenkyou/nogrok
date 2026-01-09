// Grok Blocker - Heavy Duty 2026 Edition (Merged with Keywords)
// Blocks "hey grok" + variations AND custom user keywords

let customKeywords = [];
let isBlockingEnabled = true;

const POST_SELECTOR = 'article[data-testid="tweet"]';
const TEXT_SELECTOR = '[data-testid="tweetText"]';

// 1. Initialize State (Enabled + Custom Keywords)
chrome.storage.sync.get(['blockingEnabled', 'customKeywords'], (data) => {
  isBlockingEnabled = data.blockingEnabled !== false; // Default true
  if (data.customKeywords) {
    customKeywords = data.customKeywords.map(k => k.toLowerCase());
  }
  
  if (isBlockingEnabled) {
    console.log('[GrokBlocker] Started. Custom Keywords:', customKeywords.length);
    runScans();
  }
});

// 2. Listen for Changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.blockingEnabled) {
      isBlockingEnabled = changes.blockingEnabled.newValue;
      if (isBlockingEnabled) blockSpamPosts();
      else unblockAll();
    }
    if (changes.customKeywords) {
      customKeywords = (changes.customKeywords.newValue || []).map(k => k.toLowerCase());
      console.log('[GrokBlocker] Keywords updated:', customKeywords);
      blockSpamPosts();
    }
  }
});

function unblockAll() {
  const hiddenPosts = document.querySelectorAll('article[data-grok-blocked="true"]');
  hiddenPosts.forEach(post => {
    post.style.display = '';
    post.removeAttribute('data-grok-blocked');
  });
}

// 3. Matcher Logic
function isMatch(text) {
  const lower = text.toLowerCase().trim();
  
  // A. Heavy Grok Variations (Normalized check)
  const normalized = lower.replace(/[^\w\s@]/g, ''); 
  const grokCalls = [
    'hey grok', 'hey @grok', 'heygrok', 'hey@grok',
    'yo grok', 'yo @grok', 'yogrok', 'yo@grok',
    'oi grok', 'oi @grok', 'oigrok', 'oi@grok',
    'hay grok', 'hay @grok', 'haygrok', 'hay@grok',
    'hey grock', 'hey grocks', 'heygrock', 'heygrocks',
    'hey gr0k', 'hey gr0ck'
  ];
  if (grokCalls.some(call => normalized.includes(call))) return true;

  // B. Custom Keywords (Simple includes)
  if (customKeywords.some(k => lower.includes(k))) return true;

  return false;
}

// === Text Extraction ===
function getPostText(post) {
  let el = post.querySelector(TEXT_SELECTOR);
  if (el) return (el.textContent || el.innerText || '').trim();

  el = post.querySelector('div[dir="auto"]');
  if (el) return (el.textContent || el.innerText || '').trim();

  return (post.innerText || '').trim();
}

// === Main Blocking Loop ===
function blockSpamPosts() {
  if (!isBlockingEnabled) return;

  const posts = document.querySelectorAll(POST_SELECTOR);
  let blockedCount = 0;

  posts.forEach(post => {
    if (post.getAttribute('data-grok-blocked')) return;

    const text = getPostText(post);
    if (text && isMatch(text)) {
      console.log('[GrokBlocker] MATCH & REMOVED:', text.substring(0, 80));
      
      post.style.display = 'none';
      post.setAttribute('data-grok-blocked', 'true');
      blockedCount++;
      
      chrome.storage.sync.get(['blockCount'], data => {
        chrome.storage.sync.set({ blockCount: (data.blockCount || 0) + 1 });
      });
    }
  });

  if (blockedCount > 0) console.log(`[GrokBlocker] Blocked ${blockedCount} posts.`);
}

// === Scheduling ===
function runScans() {
  const delays = [500, 1500, 3000, 5000, 8000, 12000, 20000, 40000];
  delays.forEach(ms => setTimeout(blockSpamPosts, ms));

  setInterval(blockSpamPosts, 800);

  setTimeout(() => {
    const target = document.querySelector('[data-testid="primaryColumn"]') ||
                   document.querySelector('div[data-testid="search-results"]') ||
                   document.querySelector('main') ||
                   document.body;
    
    if (target) {
      new MutationObserver(() => {
        if (isBlockingEnabled) setTimeout(blockSpamPosts, 500);
      }).observe(target, { childList: true, subtree: true });
      console.log('[GrokBlocker] Observer attached');
    }
  }, 1500);
}
