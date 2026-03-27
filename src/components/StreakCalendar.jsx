/** GitHub-style contribution grid from YYYY-MM-DD -> count */
function buildGrid(completedIsoDates) {
  const counts = {}
  completedIsoDates.forEach((iso) => {
    const key = new Date(iso).toISOString().slice(0, 10)
    counts[key] = (counts[key] || 0) + 1
  })

  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const anchor = new Date(end)
  anchor.setDate(anchor.getDate() - end.getDay())
  anchor.setDate(anchor.getDate() - 52 * 7)

  const rows = 7
  const cols = 53
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      const d = new Date(anchor)
      d.setDate(d.getDate() + c * 7 + r)
      const key = d.toISOString().slice(0, 10)
      const count = d > end ? null : counts[key] || 0
      row.push({ date: key, count })
    }
    grid.push(row)
  }
  return grid
}

function intensityClass(n) {
  if (n === null) return 'streak-empty'
  if (n <= 0) return 'streak-0'
  if (n === 1) return 'streak-1'
  if (n === 2) return 'streak-2'
  return 'streak-3'
}

function StreakCalendar({ completedDates }) {
  const matrix = buildGrid(completedDates || [])

  return (
    <div className="streak-section">
      <p className="streak-caption">Last ~year · completed exams per day</p>
      <div className="streak-grid" role="img" aria-label="Activity by day">
        {matrix.map((row, ri) => (
          <div key={ri} className="streak-row">
            {row.map((cell, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={`streak-cell ${intensityClass(cell.count)}`}
                title={cell.count === null ? '' : `${cell.date}: ${cell.count} exam(s)`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="streak-legend">
        <span>Less</span>
        <div className="streak-legend-cells">
          <div className="streak-cell streak-0" />
          <div className="streak-cell streak-1" />
          <div className="streak-cell streak-2" />
          <div className="streak-cell streak-3" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default StreakCalendar
