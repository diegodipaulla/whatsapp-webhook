"use client"

interface FormattedWhatsappTextProps {
  text: string
  truncate?: boolean
}

export function FormattedWhatsappText({ text, truncate = false }: FormattedWhatsappTextProps) {
  const formatText = (input: string) => {
    if (!input) return ""

    let formatted = input

    // Bold: *text*
    formatted = formatted.replace(/\*([^*]+)\*/g, "<strong>$1</strong>")

    // Italic: _text_
    formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>")

    // Strikethrough: ~text~
    formatted = formatted.replace(/~([^~]+)~/g, "<s>$1</s>")

    // Monospace: ```text```
    formatted = formatted.replace(/```([^`]+)```/g, "<code>$1</code>")

    return formatted
  }

  const className = `mb-1 ${truncate ? "line-clamp-3" : ""}`

  return <p className={className} dangerouslySetInnerHTML={{ __html: formatText(text) }} />
}

export default FormattedWhatsappText
