const SELECTORS = {
  reactionContainer: '[jscontroller="olnPLe"]',
  toolbar: '[role="toolbar"]',
  toolbarContainer: '[data-show-animated-unicode-emoji-on-hover="true"]',
  skinToneButton: 'div[jscontroller="lKaRTd"] button[aria-haspopup="menu"]',
  emojiButton: "button[data-emoji]",
};

const EMOJI_BUTTON_SELECTOR = `${SELECTORS.reactionContainer} ${SELECTORS.emojiButton}`;
const TOOLBAR_SELECTOR = `${SELECTORS.reactionContainer} ${SELECTORS.toolbar}`;

const EMOJI_LIST = ["💖", "👍", "🎉", "👏", "😂", "😮", "😢", "🤔", "👎"];
const PREFS_KEY = "emojiPrefs";
const DEFAULT_PREFS = Object.fromEntries(
  EMOJI_LIST.map((emoji) => [emoji, true])
);

const storage = chrome.storage?.sync ?? chrome.storage?.local;
let currentPrefs = { ...DEFAULT_PREFS };

const setVisibility = (element, shouldShow) => {
  if (!element) {
    return;
  }
  if (shouldShow) {
    if (element.dataset.meetEmojiToggleHidden) {
      delete element.dataset.meetEmojiToggleHidden;
    }
    return;
  }
  element.dataset.meetEmojiToggleHidden = "true";
};

const getEmojiFromButton = (button) => {
  const dataEmoji = button.getAttribute("data-emoji");
  if (dataEmoji) {
    return dataEmoji;
  }
  const ariaLabel = button.getAttribute("aria-label");
  if (ariaLabel) {
    return ariaLabel.trim();
  }
  const image = button.querySelector("img[alt]");
  if (image) {
    return image.getAttribute("alt");
  }
  return null;
};

const isEmojiEnabled = (emoji) => Boolean(emoji && currentPrefs[emoji]);

const applyContainerVisibility = (toolbar, hasVisible) => {
  setVisibility(toolbar, hasVisible);

  const toolbarContainer = toolbar.closest(SELECTORS.toolbarContainer);
  if (toolbarContainer) {
    setVisibility(toolbarContainer, hasVisible);
  }

  const reactionContainer = toolbar.closest(SELECTORS.reactionContainer);
  if (reactionContainer) {
    setVisibility(reactionContainer, hasVisible);

    const skinToneButton = reactionContainer.querySelector(
      SELECTORS.skinToneButton
    );
    if (skinToneButton) {
      setVisibility(skinToneButton, hasVisible);
    }
  }
};

const applyPreferences = () => {
  document.querySelectorAll(EMOJI_BUTTON_SELECTOR).forEach((button) => {
    setVisibility(button, isEmojiEnabled(getEmojiFromButton(button)));
  });

  document.querySelectorAll(TOOLBAR_SELECTOR).forEach((toolbar) => {
    const buttons = toolbar.querySelectorAll(SELECTORS.emojiButton);
    const hasVisible = Array.from(buttons).some((button) =>
      isEmojiEnabled(getEmojiFromButton(button))
    );
    applyContainerVisibility(toolbar, hasVisible);
  });
};

const setPreferences = (prefs) => {
  currentPrefs = { ...DEFAULT_PREFS, ...prefs };
};

const loadPreferences = () => {
  if (!storage) {
    applyPreferences();
    return;
  }

  storage.get({ [PREFS_KEY]: DEFAULT_PREFS }, (result) => {
    setPreferences(result[PREFS_KEY] || {});
    applyPreferences();
  });
};

let scheduled = false;
const scheduleApply = () => {
  if (scheduled) {
    return;
  }
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyPreferences();
  });
};

loadPreferences();

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (!changes[PREFS_KEY]) {
      return;
    }
    setPreferences(changes[PREFS_KEY].newValue || {});
    scheduleApply();
  });
}

const observer = new MutationObserver(scheduleApply);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
