const norm = (s) => String(s || '').toLowerCase()

export function evaluateCodeByEvaluator(evaluatorKey, code) {
  const c = String(code || '')
  switch (evaluatorKey) {
    case 'sum_natural':
      return (
        /def\s+sum_n\s*\(/.test(c) &&
        (c.includes('n * (n + 1) // 2') ||
          c.includes('n*(n+1)//2') ||
          (c.includes('for ') && c.includes('range')))
      )
    case 'factorial':
      return (
        /def\s+fact\s*\(/.test(c) &&
        (c.includes('math.factorial') || (c.includes('for ') && c.includes('range')) || c.includes('*'))
      )
    case 'reverse_string':
      return /def\s+rev\s*\(/.test(c) && (c.includes('[::-1]') || c.includes('reversed'))
    case 'max_in_list':
      return /def\s+max_in_list\s*\(/.test(c) && (c.includes('max(') || c.includes('for '))
    case 'is_even':
      return /def\s+is_even\s*\(/.test(c) && (c.includes('% 2') || c.includes('%2'))
    case 'count_vowels':
      return /def\s+count_vowels\s*\(/.test(c) && (c.includes('aeiou') || c.includes('in "aeiou"'))
    case 'fibonacci':
      return (
        /def\s+fib\s*\(/.test(c) &&
        (c.includes('for ') || c.includes('while ')) &&
        (c.includes('a') || c.includes('prev') || c.includes('fib'))
      )
    case 'binary_search':
      return /def\s+binary_search\s*\(/.test(c) && c.includes('while ') && c.includes('mid')
    default:
      return false
  }
}

export function evaluateTextKeywords(question, answer) {
  const normalized = norm(answer)
  const hits = (question.expectedKeywords || []).filter((word) => normalized.includes(word.toLowerCase()))
  const correct = hits.length >= Math.ceil((question.expectedKeywords || []).length / 2)
  return {
    correct,
    feedback: correct ? `Good coverage: ${hits.join(', ')}` : 'Answer is missing key concepts.',
  }
}
