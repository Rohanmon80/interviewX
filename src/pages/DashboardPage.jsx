import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { useAuth } from '../hooks/useAuth'
import { getMyExams } from '../services/examService'
import { getDashboardStats } from '../services/resultService'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
)

const chartFont =
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).fontFamily || 'system-ui, sans-serif'
    : 'system-ui, sans-serif'

function DashboardPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyExams()
        setHistory(data)
      } catch {
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  const stats = getDashboardStats(history)

  const pieData = useMemo(
    () => ({
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [stats.correctCount, stats.incorrectCount],
          backgroundColor: ['#6366f1', '#f9a8d4'],
          borderColor: ['#4f46e5', '#ec4899'],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    }),
    [stats.correctCount, stats.incorrectCount],
  )

  const hasMixData = stats.correctCount + stats.incorrectCount > 0

  const lineData = useMemo(
    () => ({
      labels: stats.history.map((_, index) => `#${index + 1}`),
      datasets: [
        {
          label: 'Score',
          data: stats.history.map((item) => item.score),
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderColor: '#818cf8',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 220)
            gradient.addColorStop(0, 'rgba(129, 140, 248, 0.45)')
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)')
            return gradient
          },
        },
      ],
    }),
    [stats.history],
  )

  const barData = useMemo(
    () => ({
      labels: stats.history.map((_, index) => `Attempt ${index + 1}`),
      datasets: [
        {
          label: 'Score',
          data: stats.history.map((item) => item.score),
          borderRadius: 10,
          borderSkipped: false,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const h = context.chart.height || 280
            const g = ctx.createLinearGradient(0, 0, 0, h)
            g.addColorStop(0, '#a78bfa')
            g.addColorStop(0.5, '#818cf8')
            g.addColorStop(1, '#22d3ee')
            return g
          },
          borderWidth: 0,
        },
      ],
    }),
    [stats.history],
  )

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: chartFont, size: 12 }, color: '#475569', usePointStyle: true },
        },
      },
    }),
    [],
  )

  const axisOptions = useMemo(
    () => ({
      ...commonOptions,
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.12)' },
          ticks: { color: '#64748b', font: { family: chartFont } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(99, 102, 241, 0.08)' },
          ticks: { color: '#64748b', font: { family: chartFont } },
        },
      },
    }),
    [commonOptions],
  )

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <div className="dashboard-hero-copy">
            <p className="dashboard-eyebrow">Performance overview</p>
            <h1 className="dashboard-title">
              Welcome back, <span className="dashboard-title-accent">{user?.username || 'candidate'}</span>
            </h1>
            <p className="dashboard-lead">
              Track progress across sessions, spot trends, and jump back into a new challenge when you are ready.
            </p>
            <Link to="/interview" className="dashboard-cta">
              Start new session →
            </Link>
          </div>
          <div className="dashboard-hero-stats">
            <div className="dashboard-stat-tile">
              <span className="dashboard-stat-label">Attempts</span>
              <strong className="dashboard-stat-value">{stats.totalAttempts}</strong>
            </div>
            <div className="dashboard-stat-tile dashboard-stat-tile-accent">
              <span className="dashboard-stat-label">Average score</span>
              <strong className="dashboard-stat-value">{stats.averageScore}</strong>
            </div>
            <div className="dashboard-stat-tile">
              <span className="dashboard-stat-label">Latest</span>
              <strong className="dashboard-stat-value">{stats.latestScore}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-bento">
        <section className="dashboard-panel dashboard-panel-wide">
          <div className="dashboard-panel-head">
            <h2>Score trend</h2>
            <span className="dashboard-panel-tag">Progression</span>
          </div>
          <div className="dashboard-chart-slot dashboard-chart-tall">
            {stats.history.length === 0 ? (
              <p className="dashboard-chart-fallback">Your score trend will appear after your first completed session.</p>
            ) : stats.history.length >= 2 ? (
              <Line data={lineData} options={axisOptions} />
            ) : (
              <Bar data={barData} options={axisOptions} />
            )}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-side">
          <div className="dashboard-panel-head">
            <h2>Answer mix</h2>
            <span className="dashboard-panel-tag">All time</span>
          </div>
          <div className="dashboard-chart-slot">
            {hasMixData ? (
              <Pie
                data={pieData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { position: 'bottom', labels: { ...commonOptions.plugins.legend.labels } },
                  },
                  cutout: '58%',
                }}
              />
            ) : (
              <p className="dashboard-chart-fallback">Answer a few questions to see your correct vs incorrect mix.</p>
            )}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-full">
          <div className="dashboard-panel-head">
            <h2>Session history</h2>
            <span className="dashboard-panel-tag subtle">{loading ? 'Loading…' : `${stats.history.length} saved`}</span>
          </div>
          {loading ? (
            <p className="dashboard-empty">Loading history…</p>
          ) : stats.history.length === 0 ? (
            <p className="dashboard-empty">No attempts yet — complete a session to see your records here.</p>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Language</th>
                    <th>Level</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th className="dashboard-table-num">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[...stats.history].reverse().map((entry, idx) => (
                    <tr key={`${entry._id || idx}`}>
                      <td>
                        <Link to={`/history/${entry._id}`} className="table-link">
                          {new Date(entry.completedAt || entry.updatedAt).toLocaleString()}
                        </Link>
                      </td>
                      <td>{entry.language || '—'}</td>
                      <td>
                        <span className={`dash-level dash-level-${(entry.level || 'medium').toLowerCase()}`}>
                          {entry.level || '—'}
                        </span>
                      </td>
                      <td>{entry.correctCount ?? '—'}</td>
                      <td>{entry.incorrectCount ?? '—'}</td>
                      <td className="dashboard-table-num">
                        <span className="dash-score">{entry.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
