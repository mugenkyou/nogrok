// Grok Blocker - FINAL 2026 ALGO (Simplified: Hardcoded 'hey grok')
// Aggressive & Reliable - Toggle Support

const BLOCK_PHRASE = "hey grok";  // Hardcoded
let isBlockingEnabled = true;

const POST_SELECTOR = 'article[data-testid="tweet"]';

// Initialize blocking state from storage
chrome.storage.sync.get(['blockingEnabled'], (data) => {
  isBlockingEnabled = data.blockingEnabled !== false; // Default true if undefined
  
  if (isBlockingEnabled) {
    blockSpamPosts();
  }
});

// Listen for Toggle changes ONLY
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockingEnabled) {
    isBlockingEnabled = changes.blockingEnabled.newValue;
    if (isBlockingEnabled) {
      blockSpamPosts(); // Run immediately when enabled
    } else {
      unblockAll(); // Unhide everything when disabled
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

function extractTweetText(post) {
  // Priority 1: Official attribute
  let el = post.querySelector('[data-testid="tweetText"]');
  if (el) {
    const txt = (el.textContent || el.innerText || "").trim();
    if (txt) return txt;
  }

  // Priority 2: Common text containers
  el = post.querySelector('div[dir="auto"]');
  if (el) {
    const txt = (el.textContent || el.innerText || "").trim();
    if (txt) return txt;
  }

  // Priority 3: Full post text fallback
  return post.innerText.trim();
}

function shouldBlock(text) {
  return text && text.toLowerCase().includes(BLOCK_PHRASE.toLowerCase());
}

function blockSpamPosts() {
  if (!isBlockingEnabled) return; // Exit if disabled

  const posts = document.querySelectorAll(POST_SELECTOR);
  posts.forEach(post => {
    // Avoid double processing if already blocked
    if (post.getAttribute('data-grok-blocked') === 'true') return;

    const text = extractTweetText(post);
    if (shouldBlock(text)) {
      console.log("[GrokBlocker] MATCH & REMOVED: " + text.substring(0, 150) + "...");
      
      // Use display:none for reversible toggle
      post.style.display = "none";
      post.setAttribute('data-grok-blocked', 'true');

      // Update counter
      chrome.storage.sync.get(["blockCount"], data => {
        const newCount = (data.blockCount || 0) + 1;
        chrome.storage.sync.set({ blockCount: newCount });
      });
    }
  });
}

// === Super aggressive timing for late text loading ===
const scanDelays = [300, 1000, 2500, 4500, 7000, 10000, 15000, 25000];
scanDelays.forEach(delay => setTimeout(blockSpamPosts, delay));

// Fast polling
setInterval(blockSpamPosts, 1000);

// MutationObserver
setTimeout(() => {
  const targetNode = document.querySelector('[data-testid="primaryColumn"]') ||
                     document.querySelector("main") ||
                     document.querySelector('[role="region"]') ||
                     document.body;

  if (targetNode) {
    const observer = new MutationObserver(mutations => {
      setTimeout(blockSpamPosts, 400);
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
    console.log("[GrokBlocker] MutationObserver ACTIVE");
  }
}, 1500);
