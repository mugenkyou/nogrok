// Grok Blocker - Heavy Duty 2026 Edition
// Blocks "hey grok", "yo grok", "oi grok", "@grok", and variations.

let blockPhrase = 'hey grok'; // Default custom phrase
let isBlockingEnabled = true;

const POST_SELECTOR = 'article[data-testid="tweet"]';
const TEXT_SELECTOR = '[data-testid="tweetText"]';

// Robust matcher for "Grok" spam variations
function isGrokSpam(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  // 1. Check custom phrase (if exists)
  if (blockPhrase && lower.includes(blockPhrase.toLowerCase())) return true;

  // 2. Heavy-duty list of variations (ignores case)
  const spamTriggers = [
    'hey grok', 'hey @grok', 'heygrok', 
    'yo grok', 'yo @grok', 'yogrok', 
    'oi grok', 'oi @grok', 'oigrok', 
    'hay grok', 'hay @grok', 
    'hey grock', 'yo grock'
  ];

  return spamTriggers.some(trigger => lower.includes(trigger));
}

// === Text Extraction (2026 Fallbacks) ===
function getPostText(post) {
  // 1. Official tweet text
  let el = post.querySelector(TEXT_SELECTOR);
  if (el) return (el.textContent || el.innerText || '').trim();

  // 2. dir="auto" fallback (common in search detection)
  el = post.querySelector('div[dir="auto"]');
  if (el) return (el.textContent || el.innerText || '').trim();

  // 3. Last resort: innerText
  return (post.innerText || '').trim();
}

// === Main Blocking Logic ===
function blockSpamPosts() {
  if (!isBlockingEnabled) return;

  const posts = document.querySelectorAll(POST_SELECTOR);
  let blockedCount = 0;

  posts.forEach(post => {
    // Skip if already blocked
    if (post.getAttribute('data-grok-blocked')) return;

    const text = getPostText(post);
    if (isGrokSpam(text)) {
      console.log('[GrokBlocker] MATCH & REMOVED:', text.substring(0, 100));
      
      // Remove + Hide (Double tap)
      post.remove();
      post.style.display = 'none !important';
      post.setAttribute('data-grok-blocked', 'true'); // Mark as handled

      blockedCount++;
      
      // Update counter
      chrome.storage.sync.get(['blockCount'], data => {
        chrome.storage.sync.set({ blockCount: (data.blockCount || 0) + 1 });
      });
    }
  });

  if (blockedCount > 0) {
    console.log(`[GrokBlocker] Blocked ${blockedCount} posts in this scan.`);
  }
}

// === Initialization & Config ===
chrome.storage.sync.get(['blockPhrase', 'blockingEnabled'], data => {
  if (data.blockPhrase) blockPhrase = data.blockPhrase;
  isBlockingEnabled = data.blockingEnabled !== false; // Default true if undefined
  
  if (isBlockingEnabled) {
    console.log('[GrokBlocker] Started. Phrase:', blockPhrase);
    runScans();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockPhrase) {
    blockPhrase = changes.blockPhrase.newValue;
    blockSpamPosts();
  }
  if (changes.blockingEnabled) {
    isBlockingEnabled = changes.blockingEnabled.newValue;
    if (isBlockingEnabled) blockSpamPosts();
  }
});

// === Scheduling & Observer ===
function runScans() {
  // 1. Fixed robust delays for late loading
  const delays = [500, 1500, 3000, 5000, 8000, 12000, 20000, 40000];
  delays.forEach(ms => setTimeout(blockSpamPosts, ms));

  // 2. Fast polling (800ms) for feed/search
  setInterval(blockSpamPosts, 800);

  // 3. MutationObserver
  setTimeout(() => {
    const target = document.querySelector('[data-testid="primaryColumn"]') ||
                   document.querySelector('div[data-testid="search-results"]') ||
                   document.querySelector('main') ||
                   document.querySelector('[role="region"]') ||
                   document.body;
    
    if (target) {
      new MutationObserver(() => {
        if (isBlockingEnabled) setTimeout(blockSpamPosts, 500); // Slight delay for text render
      }).observe(target, { childList: true, subtree: true });
      console.log('[GrokBlocker] Observer attached to:', target.tagName);
    }
  }, 1500);
}
