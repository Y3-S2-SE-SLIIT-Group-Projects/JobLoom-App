/**
 * Translates text on the fly using Google's public translation API.
 * This is a cost-effective way to handle dynamic user content without manual JSON entries.
 */
export const translateOnTheFly = async (text, targetLanguage) => {
  if (!text || targetLanguage.startsWith('en')) return text;

  try {
    // Map i18next language codes to Google Translate codes
    const langMap = {
      si: 'si',
      ta: 'ta',
    };

    const target = langMap[targetLanguage] || targetLanguage;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    const data = await response.json();

    // Google returns a nested array for multiple sentences
    if (data && data[0]) {
      return data[0].map(s => s[0]).join('');
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text on error
  }
};
