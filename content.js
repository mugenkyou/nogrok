// Grok Blocker - Robust 2026 version - MutationObserver + polling + Toggle + Counter

const POST_SELECTOR = 'article[data-testid="tweet"]';
const TEXT_SELECTOR = '[data-testid="tweetText"]';
// Updated Regex from latest request
const GROK_REGEX = /hey\s*(grok|grocks?|grock|grockk?|gr0k|g r o k)[^\w]*?(a|am|an|and|&|ma|m)?\s*(make|makes?|mke|mak|makee|mk|amke)\s*(a|the|this|plan|aplna|aplan|plan)?\s*plan/i;

let isBlockingEnabled = true;
let pendingBlockCount = 0;

// Initialize state from storage
chrome.storage.sync.get(['blockingEnabled'], (data) => {
  isBlockingEnabled = data.blockingEnabled !== false; // Default true
});

// Listen for toggle changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockingEnabled) {
    isBlockingEnabled = changes.blockingEnabled.newValue;
    if (!isBlockingEnabled) {
      unblockAll();
    } else {
      scanFeed();
    }
  }
});

// Restore hidden posts if toggle is switched off
function unblockAll() {
  const hiddenPosts = document.querySelectorAll('article[data-grok-blocked="true"]');
  hiddenPosts.forEach(post => {
    post.style.display = '';
    post.removeAttribute('data-grok-blocked');
  });
}

function getFeedTarget() {
  return document.querySelector('[data-testid="primaryColumn"]') ||
         document.querySelector('main[role="main"]') ||
         document.body;
}

function hideSpamPost(post) {
  if (!isBlockingEnabled) return false;
  
  // Prevent double processing
  if (post.getAttribute('data-grok-blocked') === 'true') return false;

  const textEl = post.querySelector(TEXT_SELECTOR);
  if (!textEl) return false;

  const rawText = (textEl.textContent || textEl.innerText || '').toLowerCase().trim();
  if (!rawText) return false;

  if (GROK_REGEX.test(rawText)) {
    // console.log('[GrokBlocker] MATCH FOUND → Hiding:', rawText.substring(0, 120) + '...');
    
    // We use display: none instead of remove() to allow Toggling OFF later
    post.style.display = 'none'; 
    post.setAttribute('data-grok-blocked', 'true');
    
    pendingBlockCount++;
    return true;
  }
  return false;
}

function scanFeed() {
  if (!isBlockingEnabled) return;
  const posts = document.querySelectorAll(POST_SELECTOR);
  posts.forEach(hideSpamPost);
}

// MutationObserver for new content
let observer = null;
function initObserver() {
  const target = getFeedTarget();
  if (!target || observer) return;

  observer = new MutationObserver(mutations => {
    if (!isBlockingEnabled) return;

    let added = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {  // ELEMENT_NODE
            if (node.matches && node.matches(POST_SELECTOR)) {
              hideSpamPost(node);
              added = true;
            } else if (node.querySelectorAll) {
              node.querySelectorAll(POST_SELECTOR).forEach(hideSpamPost);
              added = true;
            }
          }
        });
      }
    });
    // Extra safety scan if we detected additions
    if (added) scanFeed();  
  });

  observer.observe(target, { childList: true, subtree: true });
  // console.log('[GrokBlocker] Observer started on feed container');
}

// Start everything
setTimeout(() => {
  scanFeed();
  initObserver();
}, 2500);  // Delay for page hydration

// Fallback polling (every 4s) - catches missed loads & flushes counter
setInterval(() => {
  // 1. Fallback scan
  scanFeed();

  // 2. Batched Counter Update
  if (pendingBlockCount > 0) {
    const blocksToAdd = pendingBlockCount;
    pendingBlockCount = 0;
    
    chrome.storage.sync.get(['blockCount'], data => {
      chrome.storage.sync.set({ blockCount: (data.blockCount || 0) + blocksToAdd });
    });
  }
}, 4000);
