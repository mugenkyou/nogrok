// Grok Blocker - Final (Only 'hey grok' + Toggle + Hardcoded Phase)

const PHRASE = 'hey grok'; 
let isBlockingEnabled = true;

const POST_SELECTOR = 'article[data-testid="tweet"]';
const TEXT_SELECTOR = '[data-testid="tweetText"]';

// Load state
chrome.storage.sync.get(['blockingEnabled'], (data) => {
  isBlockingEnabled = data.blockingEnabled !== false; // Default true
  if (isBlockingEnabled) scanPosts();
});

// Listen for toggle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockingEnabled) {
    isBlockingEnabled = changes.blockingEnabled.newValue;
    if (isBlockingEnabled) {
      scanPosts();
    } else {
      unblockAll();
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

function isMatch(text) {
  const lowerText = text.toLowerCase();
  // Flexible match: "hey grok", "hey @grok", "Hey grok", "hey grok,", etc.
  return lowerText.includes('hey grok') || 
         lowerText.includes('hey @grok') ||
         lowerText.includes('heygrok') ||  // no space
         lowerText.includes('hey grock') || // common typo
         lowerText.includes('hay grok');   // typo variant
}

function getTarget() {
  return document.querySelector('[data-testid="primaryColumn"]') ||
         document.querySelector('div[data-testid="search-results"]') || 
         document.querySelector('main[role="main"]') ||
         document.querySelector('[role="region"]') ||
         document.body;
}

function hidePost(post) {
  // Check if double processing (only if enabled)
  if (!isBlockingEnabled) return false;
  if (post.getAttribute('data-grok-blocked') === 'true') return false;

  let textEl = post.querySelector(TEXT_SELECTOR);
  let text = '';
  if (textEl) {
    text = (textEl.textContent || textEl.innerText || '').trim();
  } else {
    textEl = post.querySelector('div[dir="auto"]');
    if (textEl) text = (textEl.textContent || textEl.innerText || '').trim();
    if (!text) text = post.innerText.trim();
  }

  if (text && isMatch(text)) {
    console.log('[GrokBlocker] Hiding post:', text.substring(0, 100) + '...');
    
    // Use display:none for reversibility
    post.style.display = 'none';
    post.setAttribute('data-grok-blocked', 'true');

    chrome.storage.sync.get(['blockCount'], data => {
      chrome.storage.sync.set({ blockCount: (data.blockCount || 0) + 1 });
    });
    return true;
  }
  return false;
}

function scanPosts() {
  if (!isBlockingEnabled) return;
  const posts = document.querySelectorAll(POST_SELECTOR);
  let blocked = 0;
  posts.forEach(post => {
    if (hidePost(post)) blocked++;
  });
  if (blocked > 0) console.log(`[GrokBlocker] Blocked ${blocked} posts this scan`);
}

let observer = null;
function startObserver() {
  const target = getTarget();
  if (!target || observer) return;
  observer = new MutationObserver(mutations => {
    // Only process if enabled
    if (!isBlockingEnabled) return; 

    mutations.forEach(mut => {
      if (mut.addedNodes.length) {
        mut.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches(POST_SELECTOR)) hidePost(node);
            else node.querySelectorAll(POST_SELECTOR).forEach(hidePost);
          }
        });
      }
    });
    setTimeout(scanPosts, 500);
  });
  observer.observe(target, { childList: true, subtree: true });
  console.log('[GrokBlocker] Observer started');
}

// Initial scans
setTimeout(scanPosts, 1000);
setTimeout(scanPosts, 3000);
setTimeout(scanPosts, 6000);
setTimeout(startObserver, 2000);
// Fast polling
setInterval(scanPosts, 1000);
