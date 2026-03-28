import { jsPDF } from 'jspdf'

function skillLevel(score) {
  if (score >= 40) return 'Advanced'
  if (score >= 25) return 'Intermediate'
  return 'Beginner'
}

/**
 * @param {object} exam – exam document from API
 */
export function downloadExamReportPdf(exam) {
  const doc = new jsPDF()
  const margin = 14
  const pageW = doc.internal.pageSize.getWidth()
  const maxW = pageW - margin * 2
  let y = 18
  const lh = 6

  const addParagraph = (text, fontSize = 10) => {
    if (!text) return
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(String(text), maxW)
    for (const line of lines) {
      if (y > 275) {
        doc.addPage()
        y = 18
      }
      doc.text(line, margin, y)
      y += lh
    }
  }

  doc.setFontSize(16)
  doc.setTextColor(26, 82, 118)
  doc.text('interviewX — Exam report', margin, y)
  y += 10
  doc.setTextColor(40, 40, 40)

  if (exam.status === 'completed') {
    addParagraph(`Skill level: ${skillLevel(Number(exam.score) || 0)}`, 11)
  }
  addParagraph(
    `Language: ${exam.language} · Level: ${exam.level} · Score: ${exam.score ?? '—'} · Status: ${exam.status}`,
    11,
  )
  addParagraph(`Session ID: ${exam.sessionId}`, 9)
  addParagraph(`Date: ${new Date(exam.completedAt || exam.updatedAt).toLocaleString()}`, 9)
  y += 4

  if ((exam.strengths || []).length) {
    addParagraph(`Strengths: ${exam.strengths.join(', ')}`, 10)
  }
  if ((exam.weaknesses || []).length) {
    addParagraph(`Areas to improve: ${exam.weaknesses.join(', ')}`, 10)
  }
  if ((exam.strengths || []).length || (exam.weaknesses || []).length) y += 4

  const responses = exam.responses || []
  if (!responses.length) {
    addParagraph('No recorded responses for this session.', 10)
  } else {
    responses.forEach((r, idx) => {
      if (y > 240) {
        doc.addPage()
        y = 18
      }
      doc.setFontSize(12)
      doc.setTextColor(79, 70, 229)
      doc.text(`Question ${idx + 1}`, margin, y)
      y += 8
      doc.setTextColor(40, 40, 40)
      addParagraph(r.prompt, 10)
      addParagraph(`Your answer:\n${r.userAnswer || '—'}`, 9)
      addParagraph(`Outcome: ${r.correct ? 'Correct' : 'Incorrect / skipped'}`, 9)
      if (r.feedback) addParagraph(`Feedback: ${r.feedback}`, 9)
      y += 6
    })
  }

  const slug = (exam._id && String(exam._id).slice(-8)) || 'report'
  doc.save(`interviewX-exam-report-${slug}.pdf`)
}
