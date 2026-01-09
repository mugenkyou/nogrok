// Grok Blocker - New 2026 Algorithm (Custom Phrase, Robust Detection)

let blockPhrase = 'hey grok make a plan'; // Default

const POST_SEL = 'article[data-testid="tweet"]';

function getPostText(post) {
  // Fallback chain for text extraction (handles 2026 variations)
  let el = post.querySelector('[data-testid="tweetText"]');
  if (el) return (el.textContent || el.innerText || '').trim();

  el = post.querySelector('div[dir="auto"]');
  if (el) return (el.textContent || el.innerText || '').trim();

  // Broad fallback
  return post.innerText.trim().substring(0, 500);
}

function shouldBlock(text, phrase) {
  if (!text || !phrase) return false;
  return text.toLowerCase().includes(phrase.toLowerCase());
}

function hideSpamPosts() {
  document.querySelectorAll(POST_SEL).forEach(post => {
    const text = getPostText(post);
    if (shouldBlock(text, blockPhrase)) {
      console.log('[GrokBlocker] HIDING MATCH:', text.substring(0, 120) + '...');
      post.remove(); // Reliable hide
      post.style.display = 'none !important'; // Fallback
      chrome.storage.sync.get(['blockCount'], data => {
        chrome.storage.sync.set({ blockCount: (data.blockCount || 0) + 1 });
      });
    }
  });
}

// Timed scans for delayed loading (new algo: more delays for search reliability)
const delays = [500, 1500, 3000, 5000, 8000, 12000, 20000];
delays.forEach(d => setTimeout(hideSpamPosts, d));

// Fast polling interval (1.2s for dynamic search/feed)
setInterval(hideSpamPosts, 1200);

// MutationObserver on best target (new: fallback to body if primary missing)
setTimeout(() => {
  const target = document.querySelector('[data-testid="primaryColumn"]') ||
                 document.querySelector('main[role="main"]') ||
                 document.querySelector('[role="region"]') ||
                 document.body;
  if (!target) return console.log('[GrokBlocker] No observer target');

  const observer = new MutationObserver(() => setTimeout(hideSpamPosts, 300)); // Slight delay for text
  observer.observe(target, { childList: true, subtree: true });
  console.log('[GrokBlocker] Observer active');
}, 1000);

// Load and update phrase
chrome.storage.sync.get(['blockPhrase'], data => {
  blockPhrase = data.blockPhrase || blockPhrase;
  hideSpamPosts();
});

chrome.storage.onChanged.addListener(changes => {
  if (changes.blockPhrase) {
    blockPhrase = changes.blockPhrase.newValue || blockPhrase;
    hideSpamPosts();
  }
});
