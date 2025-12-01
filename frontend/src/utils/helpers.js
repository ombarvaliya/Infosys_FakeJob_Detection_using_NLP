export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatProbability = (prob) => {
  return `${(prob * 100).toFixed(1)}%`
}

export const isValidFileType = (file) => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  return validTypes.includes(file.type)
}

export const highlightSuspiciousWords = (text, suspiciousWords) => {
  if (!suspiciousWords || suspiciousWords.length === 0) return text

  let highlightedText = text
  suspiciousWords.forEach((word) => {
    const regex = new RegExp(`(${word})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  })

  return highlightedText
}
