/** Dashboard aggregates from completed exam attempts */
export function getDashboardStats(exams) {
  const completed = (exams || []).filter((e) => e.status === 'completed').sort((a, b) => {
    const ta = new Date(a.completedAt || a.updatedAt).getTime()
    const tb = new Date(b.completedAt || b.updatedAt).getTime()
    return ta - tb
  })
  const totalAttempts = completed.length
  const latestScore = totalAttempts ? completed[totalAttempts - 1].score : 0
  const averageScore = totalAttempts
    ? Number((completed.reduce((acc, item) => acc + item.score, 0) / totalAttempts).toFixed(1))
    : 0
  const correctCount = completed.reduce((acc, item) => acc + (item.correctCount || 0), 0)
  const incorrectCount = completed.reduce((acc, item) => acc + (item.incorrectCount || 0), 0)

  return {
    history: completed,
    totalAttempts,
    latestScore,
    averageScore,
    correctCount,
    incorrectCount,
  }
}
