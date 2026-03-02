import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateOnTheFly } from '../utils/translator';

/**
 * A smart component that translates any content inside it automatically.
 * 1. Checks if the content is a translation key.
 * 2. If not, it uses the Translation API to translate the text on-the-fly.
 */
const AutoTranslate = ({ children, className = '' }) => {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleTranslation = async () => {
      // If language is English, just show original
      if (i18n.language.startsWith('en')) {
        setTranslatedText(children);
        return;
      }

      // Check if it's already a translation key (starts with a known prefix)
      // This is a simple heuristic, we can improve it
      if (typeof children === 'string' && children.includes('.')) {
        const translated = t(children);
        if (translated !== children) {
          setTranslatedText(translated);
          return;
        }
      }

      // Otherwise, translate on the fly
      setLoading(true);
      const output = await translateOnTheFly(children, i18n.language);
      setTranslatedText(output);
      setLoading(false);
    };

    handleTranslation();
  }, [children, i18n.language, t]);

  return (
    <span className={`${className} ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
      {translatedText}
    </span>
  );
};

export default AutoTranslate;
