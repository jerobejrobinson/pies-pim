import React, { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'

interface CDATARendererProps {
  content: string
}

export default function CDATARenderer({ content }: CDATARendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')

  useEffect(() => {
    const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/
    const match = content.match(cdataRegex)
    const sanitizeOptions = {
        FORCE_BODY: true,
        // must add these tag manually if use this option.
        ADD_TAGS: ['style'],
    }
    if (match && match[1]) {
      // CDATA found, extract and sanitize the HTML content
      const sanitizedHtml = DOMPurify.sanitize(match[1].trim(), sanitizeOptions)
      setHtmlContent(sanitizedHtml)
    } else {
      // No CDATA found, treat as plain text
      setHtmlContent(DOMPurify.sanitize(content))
    }
  }, [content])

  return (
    <div 
      className="cdata-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}