const EMOJI_CONFIG = [
  { emoji: "💖", label: "Heart" },
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Surprise" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🤔", label: "Thinking" },
  { emoji: "👎", label: "Thumbs down" },
];

const PREFS_KEY = "emojiPrefs";
const DEFAULT_PREFS = Object.fromEntries(
  EMOJI_CONFIG.map(({ emoji }) => [emoji, true])
);

const storage = chrome.storage?.sync ?? chrome.storage?.local;
const elements = {
  list: document.getElementById("emoji-list"),
  status: document.getElementById("status"),
};

const state = {
  prefs: { ...DEFAULT_PREFS },
  statusTimer: null,
};

const showStatus = (message) => {
  if (!elements.status) {
    return;
  }
  elements.status.textContent = message;
  elements.status.classList.add("visible");
  if (state.statusTimer) {
    window.clearTimeout(state.statusTimer);
  }
  state.statusTimer = window.setTimeout(() => {
    elements.status.classList.remove("visible");
  }, 1200);
};

const savePrefs = () => {
  if (!storage) {
    return;
  }
  storage.set({ [PREFS_KEY]: state.prefs }, () => {
    showStatus("Saved");
  });
};

const handleToggleChange = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  const emoji = target.dataset.emoji;
  if (!emoji) {
    return;
  }
  state.prefs = { ...state.prefs, [emoji]: target.checked };
  savePrefs();
};

const setPrefs = (prefs) => {
  state.prefs = { ...DEFAULT_PREFS, ...prefs };
};

const createRow = (item, index) => {
  const row = document.createElement("div");
  row.className = "row";
  row.style.animationDelay = `${index * 40}ms`;
  row.setAttribute("role", "listitem");

  const meta = document.createElement("label");
  meta.className = "meta";
  meta.setAttribute("for", `emoji-toggle-${index}`);

  const emoji = document.createElement("span");
  emoji.className = "emoji";
  emoji.textContent = item.emoji;
  emoji.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = item.label;

  meta.append(emoji, label);

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.className = "toggle";
  toggle.id = `emoji-toggle-${index}`;
  toggle.dataset.emoji = item.emoji;
  toggle.checked = Boolean(state.prefs[item.emoji]);
  toggle.setAttribute("aria-label", `Enable ${item.label} reaction`);

  row.append(meta, toggle);
  return row;
};

const renderList = () => {
  if (!elements.list) {
    return;
  }
  elements.list.textContent = "";

  const fragment = document.createDocumentFragment();
  EMOJI_CONFIG.forEach((item, index) => {
    fragment.append(createRow(item, index));
  });
  elements.list.append(fragment);
};

const syncToggles = () => {
  if (!elements.list) {
    return;
  }
  elements.list.querySelectorAll(".toggle").forEach((toggle) => {
    const emoji = toggle.dataset.emoji;
    if (!emoji) {
      return;
    }
    toggle.checked = Boolean(state.prefs[emoji]);
  });
};

const loadPrefs = () => {
  if (!storage) {
    renderList();
    return;
  }

  storage.get({ [PREFS_KEY]: DEFAULT_PREFS }, (result) => {
    setPrefs(result[PREFS_KEY] || {});
    renderList();
  });
};

if (elements.list) {
  elements.list.addEventListener("change", handleToggleChange);
}

loadPrefs();

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (!changes[PREFS_KEY]) {
      return;
    }
    setPrefs(changes[PREFS_KEY].newValue || {});
    syncToggles();
  });
}
