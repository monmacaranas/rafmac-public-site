/**
 * RAFMAC chat widget — configuration
 * -----------------------------------
 * This is the ONE place to configure the chat widget. No other file needs
 * to be touched to change providers, keys, or copy.
 *
 * provider: 'iframe'  -> embeds an external chat UI (Chatwoot, Crisp, Tawk,
 *                         Intercom, a custom bot page, etc.) via iframeUrl.
 *           'mailto'  -> no chat backend configured yet; the widget shows a
 *                         friendly "email us" fallback using mailtoAddress.
 *
 * To go live with a real chat provider:
 *   1. Set provider to 'iframe'.
 *   2. Set iframeUrl to the embeddable chat URL your provider gives you
 *      (this is usually where a provider "widget key" or "site ID" lives —
 *      paste the full embed URL they issue, ID and all).
 *
 * Nothing else in the site needs to change.
 */
window.RAFMAC_CHAT_CONFIG = {
  provider: 'mailto',

  // Paste your chat provider's embeddable widget URL here (includes your
  // account/site key). Example: 'https://app.chatprovider.com/widget/XXXXXXXX'
  iframeUrl: '',

  // Used only while provider is 'mailto', or as a fallback if iframeUrl is
  // left blank while provider is 'iframe'.
  mailtoAddress: 'hello@RAFMACcore.com',

  title: 'Chat with RAFMAC',
  subtitle: "We'll get back to you fast.",
  launcherLabel: 'Open chat'
};
