import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import { useExamLockdown } from '../hooks/useExamLockdown'
import { appendExamResponse, completeExam, createExam, getExamById } from '../services/examService'
import { evaluateAnswer, startInterviewSession } from '../services/interviewService'
import { downloadExamReportPdf } from '../utils/examReportPdf'

const LEVELS = ['Easy', 'Medium', 'Hard']
const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go']

function InterviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const levelParam = searchParams.get('level')
  const langParam = searchParams.get('lang')

  const [examId, setExamId] = useState(null)
  const [sessionId, setSessionId] = useState('')
  const [language, setLanguage] = useState(langParam || '')
  const [level, setLevel] = useState(levelParam || '')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [resultState, setResultState] = useState({ correct: false, feedback: '', checked: false })
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [saveError, setSaveError] = useState('')

  const currentQuestion = questions[questionIndex]
  const canFinish = questions.length > 0 && questionIndex >= questions.length
  const lockdownActive = Boolean(levelParam) && Boolean(langParam) && !error && !canFinish
  useExamLockdown(lockdownActive)

  const progressLabel = useMemo(
    () =>
      questions.length
        ? `${Math.min(questionIndex + 1, questions.length)} / ${questions.length}`
        : '0 / 0',
    [questionIndex, questions.length],
  )

  useEffect(() => {
    if (!levelParam || !LEVELS.includes(levelParam)) {
      navigate('/interview', { replace: true })
      return
    }
    if (!langParam || !LANGUAGES.includes(langParam)) {
      navigate('/interview', { replace: true })
      return
    }
    setLevel(levelParam)
    setLanguage(langParam)
    const load = async () => {
      setLoading(true)
      setError('')
      setExamId(null)
      try {
        const data = await startInterviewSession(levelParam, 5)
        setSessionId(data.sessionId)
        const qs = data.questions || []
        if (!qs.length) {
          setError('No questions returned for this level.')
          return
        }
        setQuestions(qs)
        const exam = await createExam({
          language: langParam,
          level: levelParam,
          sessionId: data.sessionId,
          questions: qs,
        })
        setExamId(exam._id)
      } catch {
        setError('Could not start session. Is the API running and are you logged in?')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [levelParam, langParam, navigate])

  useEffect(() => {
    if (!currentQuestion) return
    setAnswer(currentQuestion.type === 'code' ? currentQuestion.starterCode || '' : '')
    setResultState({ correct: false, feedback: '', checked: false })
  }, [currentQuestion])

  const persistResponse = async (payload) => {
    if (!examId) return
    await appendExamResponse(examId, payload)
  }

  const handleRunSubmit = async () => {
    if (!currentQuestion) return
    try {
      const evaluation = await evaluateAnswer(currentQuestion, answer)
      setResultState({ ...evaluation, checked: true })
      if (evaluation.correct) {
        setScore((prev) => prev + 10)
        setCorrectCount((prev) => prev + 1)
      } else {
        setIncorrectCount((prev) => prev + 1)
      }
    } catch {
      setResultState({
        correct: false,
        checked: true,
        feedback: 'Evaluation failed. Check server logs and API URL.',
      })
    }
  }

  const handleNext = async () => {
    if (currentQuestion && examId) {
      try {
        await persistResponse({
          questionId: currentQuestion.id,
          prompt: currentQuestion.prompt,
          questionType: currentQuestion.type,
          userAnswer: answer,
          correct: true,
          feedback: resultState.feedback || '',
        })
      } catch {
        /* still advance */
      }
    }
    setQuestionIndex((prev) => prev + 1)
  }

  const handleSkip = async () => {
    if (!currentQuestion || !examId) {
      setIncorrectCount((prev) => prev + 1)
      setQuestionIndex((prev) => prev + 1)
      return
    }
    try {
      await persistResponse({
        questionId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        questionType: currentQuestion.type,
        userAnswer: answer.trim() || '[skipped]',
        correct: false,
        feedback: resultState.checked ? resultState.feedback : 'Skipped',
      })
    } catch {
      /* still advance */
    }
    setIncorrectCount((prev) => prev + 1)
    setQuestionIndex((prev) => prev + 1)
  }

  const handleRetry = () => {
    setResultState({ correct: false, feedback: '', checked: false })
    setAnswer(currentQuestion?.type === 'code' ? currentQuestion.starterCode || '' : '')
  }

  const handleDownloadPdf = async () => {
    if (!examId) return
    try {
      const full = await getExamById(examId)
      downloadExamReportPdf({
        ...full,
        language,
        level,
        sessionId,
        score,
        correctCount,
        incorrectCount,
        status: 'completed',
        completedAt: new Date().toISOString(),
        strengths: score >= 20 ? ['Concept clarity', 'Problem solving'] : ['Basics', 'Persistence'],
        weaknesses: score < 20 ? ['Edge cases', 'Precision'] : ['Advanced patterns', 'Speed'],
      })
    } catch {
      /* ignore */
    }
  }

  const handleFinish = async () => {
    const finalResult = {
      score,
      correctCount,
      incorrectCount,
      level,
      sessionId,
      strengths: score >= 20 ? ['Concept clarity', 'Problem solving'] : ['Basics', 'Persistence'],
      weaknesses: score < 20 ? ['Edge cases', 'Precision'] : ['Advanced patterns', 'Speed'],
    }
    setSaveError('')
    if (!examId) {
      setSaveError('Missing exam record.')
      return
    }
    try {
      await completeExam(examId, finalResult)
      navigate(`/history/${examId}`, { replace: true })
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Save failed'
      setSaveError(`${msg}. If you see 401, log out and sign in again.`)
    }
  }

  if (loading) {
    return (
      <main className={`layout ${lockdownActive ? 'exam-lockdown' : ''}`}>
        {lockdownActive ? (
          <p className="exam-lock-notice">Preparing your session — copy and paste stay disabled.</p>
        ) : null}
        <section className="card card-glow">
          <p className="loading-pulse">Building your unique question set…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="layout">
        <section className="card card-glow">
          <p className="error-text">{error}</p>
        </section>
      </main>
    )
  }

  if (canFinish) {
    return (
      <main className="layout">
        <section className="card card-glow finish-card">
          <h2>Round complete</h2>
          <p>
            {language} · {level} · Score: <strong>{score}</strong>
          </p>
          {saveError ? <p className="error-text">{saveError}</p> : null}
          <div className="finish-actions">
            <button type="button" className="btn-secondary" onClick={() => void handleDownloadPdf()}>
              Download Result (PDF)
            </button>
            <button type="button" className="btn-primary" onClick={() => void handleFinish()}>
              Save &amp; view in history
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="layout exam-lockdown">
      <p className="exam-lock-notice">Exam mode: copying and pasting are disabled in this window.</p>
      <section className="card quiz-header card-glow">
        <div>
          <p className="kicker-alt">
            {language} · {level}
          </p>
          <h2 className="quiz-title">Question {progressLabel}</h2>
        </div>
        <div className="pill-row">
          <span className="pill pill-lang">{language}</span>
          <span className="pill pill-level">{level}</span>
          <span className="pill pill-score">Score {score}</span>
        </div>
      </section>

      <section className="card quiz-body card-glow">
        <h3 className="question-text">{currentQuestion?.prompt}</h3>
        {currentQuestion?.type === 'code' ? (
          <CodeEditor value={answer} onChange={setAnswer} />
        ) : (
          <textarea
            className="answer-area"
            rows={8}
            value={answer}
            placeholder="Type your answer…"
            onChange={(event) => setAnswer(event.target.value)}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
          />
        )}
        {resultState.checked ? (
          <p className={resultState.correct ? 'feedback-success' : 'feedback-error'}>
            {resultState.feedback}
          </p>
        ) : null}
        <div className="controls">
          <button type="button" className="btn-primary" onClick={() => void handleRunSubmit()}>
            Run &amp; Submit
          </button>
          {resultState.correct ? (
            <button type="button" className="btn-secondary" onClick={() => void handleNext()}>
              Next question
            </button>
          ) : null}
          <button type="button" className="btn-ghost" onClick={() => void handleSkip()}>
            Skip
          </button>
          <button type="button" className="btn-ghost" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </section>
    </main>
  )
}

export default InterviewPage
