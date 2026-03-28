/**
 * One row per question in the session, in exam order.
 * - Dedupes by questionId (keeps latest submission).
 * - Only includes questions that were in questionsSnapshot (the actual exam set).
 */
export function buildDisplayResponses(exam) {
  const snapshot = Array.isArray(exam.questionsSnapshot) ? exam.questionsSnapshot : []
  const orderIds = snapshot.map((q) => q?.id).filter(Boolean)

  const latestById = new Map()
  for (const r of exam.responses || []) {
    if (r?.questionId) {
      latestById.set(r.questionId, r)
    }
  }

  if (orderIds.length > 0) {
    const out = []
    for (const qid of orderIds) {
      if (latestById.has(qid)) {
        out.push(latestById.get(qid))
      }
    }
    return out
  }

  return Array.from(latestById.values()).sort(
    (a, b) => new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0),
  )
}
