import sanitizeHtml from 'sanitize-html';

/**
 * Strip all HTML tags from a string and trim any whitespace
 */
export const sanitizeText = (dirty?: string) => {
  return sanitizeHtml(dirty?.trim() || '', {
    allowedTags: [],
  });
};

/**
 * Normalize text by trimming whitespace and converting to lowercase
 */
export const normalizeText = (text?: string) => {
  return text?.trim().toLowerCase() || '';
};
