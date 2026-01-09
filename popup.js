document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('count');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const resetBtn = document.getElementById('reset');

  // Load Initial Data
  chrome.storage.sync.get(['blockCount', 'blockingEnabled'], (data) => {
    updateUI(data);
  });

  // Listen for changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockCount || changes.blockingEnabled) {
      chrome.storage.sync.get(['blockCount', 'blockingEnabled'], (data) => {
        updateUI(data);
      });
    }
  });

  function updateUI(data) {
    countEl.innerText = data.blockCount || 0;
    if (toggleSwitch) {
      const isActive = data.blockingEnabled !== false;
      toggleSwitch.checked = isActive;
      
      const dot = document.getElementById('statusDot');
      if (dot) {
        if (isActive) dot.classList.remove('inactive');
        else dot.classList.add('inactive');
      }
    }
  }

  function reloadTabs() {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
      tabs.forEach(tab => chrome.tabs.reload(tab.id));
    });
  }

  // Toggle Listener
  if (toggleSwitch) {
    toggleSwitch.addEventListener('change', (e) => {
      chrome.storage.sync.set({ blockingEnabled: e.target.checked }, () => {
        reloadTabs();
      });
    });
  }

  // Reset Listener
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chrome.storage.sync.set({ blockCount: 0 });
    });
  }

  // Manage Keywords Logic (Tag UI)
  const manageBtn = document.getElementById('manageKeywords');
  const keywordsSection = document.getElementById('keywordsSection');
  const tagsContainer = document.getElementById('tagsContainer');
  const newKeywordInput = document.getElementById('newKeyword');
  const addKeywordBtn = document.getElementById('addKeyword');
  const saveKeywordsBtn = document.getElementById('saveKeywords');

  let currentKeywords = [];

  function renderTags() {
    tagsContainer.innerHTML = '';
    currentKeywords.forEach((keyword, index) => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `
        <span>${keyword}</span>
        <span class="tag-remove" data-index="${index}">&times;</span>
      `;
      tagsContainer.appendChild(tag);
    });
  }

  function addKeyword() {
    const val = newKeywordInput.value.trim();
    if (val && !currentKeywords.includes(val)) {
      currentKeywords.push(val);
      renderTags();
      newKeywordInput.value = '';
    }
  }

  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      const isHidden = keywordsSection.style.display === 'none';
      keywordsSection.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        chrome.storage.sync.get(['customKeywords'], (data) => {
          currentKeywords = data.customKeywords || [];
          renderTags();
        });
      }
    });
  }

  if (addKeywordBtn) {
    addKeywordBtn.addEventListener('click', addKeyword);
  }
  
  if (newKeywordInput) {
    newKeywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addKeyword();
    });
  }

  if (tagsContainer) {
    tagsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-remove')) {
        const index = e.target.getAttribute('data-index');
        currentKeywords.splice(index, 1);
        renderTags();
      }
    });
  }

  if (saveKeywordsBtn) {
    saveKeywordsBtn.addEventListener('click', () => {
      chrome.storage.sync.set({ customKeywords: currentKeywords }, () => {
        saveKeywordsBtn.innerText = 'Saved!';
        setTimeout(() => saveKeywordsBtn.innerText = 'Save List', 1500);
        reloadTabs();
      });
    });
  }
});
