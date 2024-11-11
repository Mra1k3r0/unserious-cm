/**
 * @fileoverview Background script for Unserious Cookie Manager Chrome Extension
 * @author John Paul Caigas (mra1k3r0) <github.com/mra1k3r0>
 *
 * This script handles message passing between the extension's popup and the browser,
 * managing cookie operations such as getting, setting, and deleting cookies.
 */

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  /**
   * Handles getting all cookies for the current tab
   * @param {string} origin - The origin URL of the current tab
   */
  const handleGetCookies = (origin: string) => {
    chrome.cookies.getAll({ url: origin }, cookies => {
      sendResponse(cookies);
    });
  };

  /**
   * Handles setting new cookies for the current tab
   * @param {string} origin - The origin URL of the current tab
   * @param {string} cookieString - String containing cookie data to set
   */
  const handleSetCookies = (origin: string, cookieString: string) => {
    // First, remove all existing cookies
    chrome.cookies.getAll({ url: origin }, existingCookies => {
      existingCookies.forEach(cookie => {
        chrome.cookies.remove({
          url: origin,
          name: cookie.name,
        });
      });

      // Then set the new cookies
      const cookies = cookieString.split(';').map((cookie: string) => cookie.trim());
      cookies.forEach((cookie: string) => {
        const [name, value] = cookie.split('=');
        if (name && value) {
          chrome.cookies.set({
            url: origin,
            name: name.trim(),
            value: value.trim(),
          });
        }
      });

      sendResponse({ success: true });
    });
  };

  /**
   * Handles deleting all cookies for the current tab
   * @param {string} origin - The origin URL of the current tab
   */
  const handleDeleteAllCookies = (origin: string) => {
    chrome.cookies.getAll({ url: origin }, cookies => {
      cookies.forEach(cookie => {
        chrome.cookies.remove({
          url: origin,
          name: cookie.name,
        });
      });
      sendResponse({ success: true });
    });
  };

  // Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0].url ? new URL(tabs[0].url) : null;
    if (url) {
      switch (request.action) {
        case 'getCookies':
          handleGetCookies(url.origin);
          break;
        case 'setCookies':
          handleSetCookies(url.origin, request.cookies);
          break;
        case 'deleteAllCookies':
          handleDeleteAllCookies(url.origin);
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } else {
      sendResponse({ success: false, error: 'No active tab URL found' });
    }
  });

  return true; // Indicates that the response is sent asynchronously
});
