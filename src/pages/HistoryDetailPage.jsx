import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getExamById } from '../services/examService'

function HistoryDetailPage() {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getExamById(id)
        setExam(data)
      } catch {
        setError('Could not load this exam.')
      }
    }
    void load()
  }, [id])

  if (error) {
    return (
      <div className="layout">
        <p className="error-text">{error}</p>
        <Link to="/history">← Back to history</Link>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="layout">
        <p className="dashboard-empty">Loading…</p>
      </div>
    )
  }

  return (
    <div className="history-detail layout">
      <Link to="/history" className="back-link">
        ← All exams
      </Link>
      <header className="history-detail-head">
        <h1 className="page-title">Session detail</h1>
        <div className="history-detail-meta">
          <span className="pill pill-lang">{exam.language}</span>
          <span className="pill pill-level">{exam.level}</span>
          {exam.status === 'completed' ? (
            <span className="pill pill-score">Score {exam.score}</span>
          ) : (
            <span className="pill">In progress</span>
          )}
        </div>
        <p className="page-lead mono">{exam.sessionId}</p>
      </header>

      <section className="qa-list">
        {(exam.responses || []).length === 0 ? (
          <p className="dashboard-empty">No answers recorded for this attempt yet.</p>
        ) : (
          (exam.responses || []).map((r, idx) => (
            <article key={`${r.questionId}-${idx}`} className="qa-item card card-glow">
              <div className="qa-head">
                <span className="qa-num">Q{idx + 1}</span>
                <span className={`qa-badge ${r.correct ? 'ok' : 'bad'}`}>
                  {r.correct ? 'Correct' : 'Incorrect / skipped'}
                </span>
              </div>
              <p className="qa-prompt">{r.prompt}</p>
              <div className="qa-block">
                <span className="qa-label">Your answer</span>
                <pre className="qa-answer">{r.userAnswer || '—'}</pre>
              </div>
              {r.feedback ? (
                <p className="qa-feedback">{r.feedback}</p>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default HistoryDetailPage
