export type Lang = { code: string; label: string; speech: string; group: string };

export const LANGUAGES: Lang[] = [
  { code: "en", label: "English", speech: "en-US", group: "Default" },
  // Zambian
  { code: "bem", label: "Bemba", speech: "en-ZA", group: "Zambian" },
  { code: "ny", label: "Nyanja / Chewa", speech: "en-ZA", group: "Zambian" },
  { code: "toi", label: "Tonga", speech: "en-ZA", group: "Zambian" },
  { code: "loz", label: "Lozi", speech: "en-ZA", group: "Zambian" },
  { code: "lun", label: "Lunda", speech: "en-ZA", group: "Zambian" },
  { code: "lue", label: "Luvale", speech: "en-ZA", group: "Zambian" },
  { code: "kqn", label: "Kaonde", speech: "en-ZA", group: "Zambian" },
  // European
  { code: "fr", label: "French", speech: "fr-FR", group: "European" },
  { code: "es", label: "Spanish", speech: "es-ES", group: "European" },
  { code: "pt", label: "Portuguese", speech: "pt-PT", group: "European" },
  { code: "de", label: "German", speech: "de-DE", group: "European" },
  { code: "it", label: "Italian", speech: "it-IT", group: "European" },
  { code: "nl", label: "Dutch", speech: "nl-NL", group: "European" },
  { code: "sv", label: "Swedish", speech: "sv-SE", group: "European" },
  { code: "no", label: "Norwegian", speech: "nb-NO", group: "European" },
  { code: "da", label: "Danish", speech: "da-DK", group: "European" },
  { code: "fi", label: "Finnish", speech: "fi-FI", group: "European" },
  { code: "pl", label: "Polish", speech: "pl-PL", group: "European" },
  { code: "cs", label: "Czech", speech: "cs-CZ", group: "European" },
  { code: "sk", label: "Slovak", speech: "sk-SK", group: "European" },
  { code: "hu", label: "Hungarian", speech: "hu-HU", group: "European" },
  { code: "ro", label: "Romanian", speech: "ro-RO", group: "European" },
  { code: "bg", label: "Bulgarian", speech: "bg-BG", group: "European" },
  { code: "el", label: "Greek", speech: "el-GR", group: "European" },
  { code: "hr", label: "Croatian", speech: "hr-HR", group: "European" },
  { code: "sr", label: "Serbian", speech: "sr-RS", group: "European" },
  { code: "uk", label: "Ukrainian", speech: "uk-UA", group: "European" },
  { code: "ru", label: "Russian", speech: "ru-RU", group: "European" },
  { code: "tr", label: "Turkish", speech: "tr-TR", group: "European" },
  { code: "ga", label: "Irish", speech: "en-IE", group: "European" },
  { code: "lt", label: "Lithuanian", speech: "lt-LT", group: "European" },
  { code: "lv", label: "Latvian", speech: "lv-LV", group: "European" },
  { code: "et", label: "Estonian", speech: "et-EE", group: "European" },
  { code: "sl", label: "Slovenian", speech: "sl-SI", group: "European" },
  { code: "ca", label: "Catalan", speech: "ca-ES", group: "European" },
  // Asian
  { code: "zh", label: "Chinese (Mandarin)", speech: "zh-CN", group: "Asian" },
  { code: "yue", label: "Chinese (Cantonese)", speech: "zh-HK", group: "Asian" },
  { code: "ja", label: "Japanese", speech: "ja-JP", group: "Asian" },
  { code: "ko", label: "Korean", speech: "ko-KR", group: "Asian" },
  { code: "hi", label: "Hindi", speech: "hi-IN", group: "Asian" },
  { code: "bn", label: "Bengali", speech: "bn-IN", group: "Asian" },
  { code: "ur", label: "Urdu", speech: "ur-PK", group: "Asian" },
  { code: "ta", label: "Tamil", speech: "ta-IN", group: "Asian" },
  { code: "te", label: "Telugu", speech: "te-IN", group: "Asian" },
  { code: "mr", label: "Marathi", speech: "mr-IN", group: "Asian" },
  { code: "gu", label: "Gujarati", speech: "gu-IN", group: "Asian" },
  { code: "pa", label: "Punjabi", speech: "pa-IN", group: "Asian" },
  { code: "th", label: "Thai", speech: "th-TH", group: "Asian" },
  { code: "vi", label: "Vietnamese", speech: "vi-VN", group: "Asian" },
  { code: "id", label: "Indonesian", speech: "id-ID", group: "Asian" },
  { code: "ms", label: "Malay", speech: "ms-MY", group: "Asian" },
  { code: "fil", label: "Filipino", speech: "fil-PH", group: "Asian" },
  { code: "ar", label: "Arabic", speech: "ar-SA", group: "Asian" },
  { code: "fa", label: "Persian", speech: "fa-IR", group: "Asian" },
  { code: "he", label: "Hebrew", speech: "he-IL", group: "Asian" },
  { code: "ne", label: "Nepali", speech: "ne-NP", group: "Asian" },
  { code: "si", label: "Sinhala", speech: "si-LK", group: "Asian" },
  { code: "my", label: "Burmese", speech: "my-MM", group: "Asian" },
  { code: "km", label: "Khmer", speech: "km-KH", group: "Asian" },
];

export const LANG_KEY = "hampro_language_v1";

export function getLanguage(): string {
  if (typeof window === "undefined") return "en";
  try { return localStorage.getItem(LANG_KEY) || "en"; } catch { return "en"; }
}

export function setLanguage(code: string) {
  try { localStorage.setItem(LANG_KEY, code); } catch {}
}

export function langByCode(code: string): Lang {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}