document.addEventListener("DOMContentLoaded", async () => {
  const modeRadios = document.querySelectorAll("input[name='mode']");
  const siteListEl = document.getElementById("site-list");
  const addButton = document.getElementById("add-button");
  const siteInput = document.getElementById("site-input");

  let currentMode = "blacklist"; // default
  let siteLists = {
    whitelist: [],
    blacklist: []
  };

  // Load data from storage
  chrome.storage.local.get(["mode", "whitelistSites", "blacklistSites"], (data) => {
    currentMode = data.mode || "blacklist";
    siteLists.whitelist = data.whitelistSites || [];
    siteLists.blacklist = data.blacklistSites || [];

    // Set toggle state
    document.querySelector(`input[value="${currentMode}"]`).checked = true;

    updateTooltip(currentMode);
    renderSiteList();
  });

  // Mode toggle change
  modeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentMode = e.target.value;
      chrome.storage.local.set({ mode: currentMode });
      updateTooltip(currentMode);
      renderSiteList();
    });
  });

  // Add site button click
  addButton.addEventListener("click", () => {
    const newSite = siteInput.value.trim();
    if (newSite && !siteLists[currentMode].includes(newSite)) {
      siteLists[currentMode].push(newSite);
      saveCurrentList();
      renderSiteList();
      siteInput.value = "";
    }
  });

  // Autosave when removing a site (delegated event)
  siteListEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const siteToRemove = e.target.dataset.site;
      siteLists[currentMode] = siteLists[currentMode].filter(site => site !== siteToRemove);
      saveCurrentList();
      renderSiteList();
    }
  });

  function updateTooltip(mode) {
    const tooltip = document.getElementById("mode-tooltip");
    if (mode === "whitelist") {
      tooltip.innerText = "Only these sites will stay open. All others will be hidden.";
    } else {
      tooltip.innerText = "These sites will be hidden. All others will stay open.";
    }
  }

  function renderSiteList() {
    siteListEl.innerHTML = "";
    siteLists[currentMode].forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList.add("remove-btn");
      removeBtn.setAttribute("data-site", site);

      li.appendChild(removeBtn);
      siteListEl.appendChild(li);
    });
  }

  function saveCurrentList() {
    const key = currentMode === "whitelist" ? "whitelistSites" : "blacklistSites";
    const toSave = {};
    toSave[key] = siteLists[currentMode];
    chrome.storage.local.set(toSave);
  }

    document.getElementById("hideTabs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "hide_tabs" });
  });

  document.getElementById("restoreTabs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "restore_tabs" });
  });
});
