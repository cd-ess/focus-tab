let hiddenTabs = [];

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "hide_tabs") {
    chrome.tabs.query({}, (tabs) => {
      chrome.storage.local.get(["mode", "whitelistSites", "blacklistSites"], (data) => {
        const mode = data.mode || "blacklist";
        const list = (mode === "whitelist" ? data.whitelistSites : data.blacklistSites) || [];

        const distracting = tabs.filter(tab => {
          if (!tab.url) return false;
          return mode === "blacklist"
            ? list.some(site => tab.url.includes(site))
            : !list.some(site => tab.url.includes(site));
        });

        hiddenTabs = distracting.map(tab => tab);
        chrome.storage.local.set({ hiddenTabs });

        distracting.forEach(tab => {
          chrome.tabs.remove(tab.id);
        });

        chrome.alarms.create("restore_tabs", { delayInMinutes: 30 });
      });
    });
  }

  if (msg.action === "restore_tabs") {
    restoreTabs();
  }
});

// Restore tabs when timer fires
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "restore_tabs") {
    restoreTabs();
  }
});

// Reopen saved hidden tabs
function restoreTabs() {
  chrome.storage.local.get("hiddenTabs", (data) => {
    if (data.hiddenTabs) {
      data.hiddenTabs.forEach(tab => {
        chrome.tabs.create({ url: tab.url });
      });
      chrome.storage.local.remove("hiddenTabs");
    }
  });
}
