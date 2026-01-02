# Meet Emoji Blocker

## Introduction

Meet Emoji Blocker is a Chrome extension that hides Google Meet reaction emoji buttons to prevent accidental clicks. It ships with an options page where you can enable or disable each reaction emoji individually.. All reactions are enabled by default.

## Specification

- Scope: runs only on https://meet.google.com/* as a Manifest V3 content script and stylesheet.
- Reaction discovery: finds reaction buttons inside the Meet reaction container using `button[data-emoji]` and falls back to `aria-label` or `img[alt]` when needed.
- Visibility control: toggles a `data-meet-emoji-toggle-hidden` attribute on individual buttons and containers; CSS hides any element with that attribute.
- Container behavior: hides the reaction toolbar, its container, the overall reaction container, and the skin tone menu when no reactions are enabled.
- Preferences: stored under the `emojiPrefs` key in `chrome.storage.sync` with a fallback to `chrome.storage.local`; defaults to all reactions enabled.
- Live updates: listens for storage changes to apply updates immediately, and uses a MutationObserver to re-apply visibility as the Meet UI changes.
- Options UI: shows a list of reactions with checkboxes; changes are saved immediately with a brief Saved status message.
- Permissions: requires only the `storage` permission and does not make network requests.
- Constraints: the selectors and reaction list target the current Meet UI; changes to the Meet DOM or available reactions may require updates.
