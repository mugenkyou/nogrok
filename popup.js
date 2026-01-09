function updateUI(data) {
  document.getElementById('count').innerText = `Blocked posts: ${data.blockCount || 0}`;
  document.getElementById('blockPhrase').value = data.blockPhrase || 'hey grok make a plan';
}

chrome.storage.sync.get(['blockCount', 'blockPhrase'], updateUI);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockCount || changes.blockPhrase) {
    chrome.storage.sync.get(['blockCount', 'blockPhrase'], updateUI);
  }
});

document.getElementById('save').addEventListener('click', () => {
  const phrase = document.getElementById('blockPhrase').value.trim();
  if (phrase) {
    chrome.storage.sync.set({ blockPhrase: phrase });
  }
});

document.getElementById('reset').addEventListener('click', () => {
  chrome.storage.sync.set({ blockCount: 0 });
});
