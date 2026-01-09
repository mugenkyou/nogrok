document.addEventListener('DOMContentLoaded', () => {
  const countElement = document.getElementById('count');
  const resetBtn = document.getElementById('resetBtn');
  const toggleSwitch = document.getElementById('toggleSwitch');

  // Load initial state
  chrome.storage.sync.get(['blockCount', 'blockingEnabled'], (data) => {
    updateDisplay(data.blockCount || 0);
    // Default enabled if undefined
    toggleSwitch.checked = data.blockingEnabled !== false;
  });

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.blockCount) {
        updateDisplay(changes.blockCount.newValue || 0);
      }
      if (changes.blockingEnabled) {
        toggleSwitch.checked = changes.blockingEnabled.newValue !== false;
      }
    }
  });

  // Toggle switch handler
  toggleSwitch.addEventListener('change', (e) => {
    chrome.storage.sync.set({ blockingEnabled: e.target.checked });
  });

  // Reset button handler
  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ blockCount: 0 });
    updateDisplay(0);
  });

  function updateDisplay(count) {
    countElement.textContent = `Blocked: ${count}`;
  }
});
