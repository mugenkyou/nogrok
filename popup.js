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
    countEl.innerText = `Blocked: ${data.blockCount || 0}`;
    if (toggleSwitch) {
      toggleSwitch.checked = data.blockingEnabled !== false; // Default true
    }
  }

  // Toggle Listener
  if (toggleSwitch) {
    toggleSwitch.addEventListener('change', (e) => {
      chrome.storage.sync.set({ blockingEnabled: e.target.checked });
    });
  }

  // Reset Listener
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chrome.storage.sync.set({ blockCount: 0 });
    });
  }
});
