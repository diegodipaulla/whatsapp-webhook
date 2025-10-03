import React from 'react';

// Simple parser for WhatsApp-like text formatting
function formatWhatsappText(text) {
  if (!text) return '';

  // Escape HTML to prevent XSS if the text is not fully controlled
  // For this use case, we assume the message body is safe.

  let formattedText = text
    // Bold: *text*
    .replace(/\*([^\*]+)\*/g, '<strong>$1</strong>')
    // Italic: _text_
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Strikethrough: ~text~
    .replace(/~([^~]+)~/g, '<s>$1</s>')
    // Monospace: ```text```
    .replace(/```([^`]+)```/g, '<code>$1</code>');

  return formattedText;
}

const FormattedWhatsappText = ({ text, truncate = false }) => {
  const html = { __html: formatWhatsappText(text) };
  const className = `mb-1 ${truncate ? 'truncate-3-lines' : ''}`;
  return <p className={className} dangerouslySetInnerHTML={html}></p>;
};

export default FormattedWhatsappText;
