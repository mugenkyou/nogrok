document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('count');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusLabel = document.getElementById('statusLabel');
  const resetBtn = document.getElementById('resetBtn');

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
    // Update Counter
    countEl.innerText = data.blockCount || 0;
    
    // Update Toggle
    const isEnabled = data.blockingEnabled !== false; // Default true
    if (toggleSwitch) {
      toggleSwitch.checked = isEnabled;
    }
    
    // Update visual label
    if (statusLabel) {
      statusLabel.innerText = isEnabled ? 'Enabled' : 'Disabled';
      statusLabel.style.color = isEnabled ? '#1D9BF0' : '#71767B';
    }
  }

  // Toggle Switch Handler
  toggleSwitch.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ blockingEnabled: isEnabled });
    // Optimistic UI update
    if (statusLabel) {
      statusLabel.innerText = isEnabled ? 'Enabled' : 'Disabled';
      statusLabel.style.color = isEnabled ? '#1D9BF0' : '#71767B';
    }
  });

  // Reset Button Handler
  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ blockCount: 0 });
  });
});
