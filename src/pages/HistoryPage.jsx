import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyExams } from '../services/examService'

function HistoryPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyExams()
        setExams(data)
      } catch {
        setExams([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="history-page layout">
      <header className="history-header">
        <h1 className="page-title">Exam history</h1>
        <p className="page-lead">Open any session to review questions and your submitted answers.</p>
      </header>
      {loading ? (
        <p className="dashboard-empty">Loading…</p>
      ) : exams.length === 0 ? (
        <p className="dashboard-empty">No exams yet — start one from the Interview tab.</p>
      ) : (
        <ul className="history-cards">
          {exams.map((exam) => (
            <li key={exam._id}>
              <Link to={`/history/${exam._id}`} className="history-card-link">
                <div className="history-card-top">
                  <span className={`dash-level dash-level-${(exam.level || 'medium').toLowerCase()}`}>
                    {exam.level}
                  </span>
                  <span
                    className={`history-status ${exam.status === 'completed' ? 'done' : 'open'}`}
                  >
                    {exam.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </div>
                <div className="history-card-body">
                  <strong className="history-lang">{exam.language}</strong>
                  <span className="history-meta">
                    {new Date(exam.updatedAt).toLocaleString()}
                  </span>
                </div>
                {exam.status === 'completed' ? (
                  <div className="history-card-score">Score {exam.score}</div>
                ) : (
                  <div className="history-card-score muted">Continue in Interview</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryPage
