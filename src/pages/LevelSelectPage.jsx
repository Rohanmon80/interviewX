import { useState } from 'react'
import { Link } from 'react-router-dom'

const languages = [
  { key: 'Python', label: 'Python', hint: 'Data & backends' },
  { key: 'JavaScript', label: 'JavaScript', hint: 'Web & Node' },
  { key: 'TypeScript', label: 'TypeScript', hint: 'Typed JS' },
  { key: 'Java', label: 'Java', hint: 'Enterprise' },
  { key: 'C++', label: 'C++', hint: 'Systems' },
  { key: 'C#', label: 'C#', hint: '.NET' },
  { key: 'Go', label: 'Go', hint: 'Cloud native' },
]

const levels = [
  { key: 'Easy', title: 'Easy', blurb: 'Warm-up concepts and short tasks.', accent: 'level-surface-easy' },
  { key: 'Medium', title: 'Medium', blurb: 'Typical interview depth.', accent: 'level-surface-medium' },
  { key: 'Hard', title: 'Hard', blurb: 'Stretch topics & patterns.', accent: 'level-surface-hard' },
]

function LevelSelectPage() {
  const [language, setLanguage] = useState('')

  return (
    <main className="layout layout-tight setup-flow">
      <section className="setup-hero">
        <p className="kicker-alt">Configure session</p>
        <h1 className="hero-title setup-title">Start your exam</h1>
        <p className="hero-sub setup-sub">
          Pick the language this session represents (questions stay logic-focused; your pick is stored with your
          record). Then choose difficulty.
        </p>
      </section>
      <section className="setup-block">
        <h2 className="setup-heading">
          <span className="setup-step">1</span> Language
        </h2>
        <div className="lang-grid">
          {languages.map((lang) => (
            <button
              key={lang.key}
              type="button"
              className={`lang-card ${language === lang.key ? 'lang-card-active' : ''}`}
              onClick={() => setLanguage(lang.key)}
            >
              <strong>{lang.label}</strong>
              <span>{lang.hint}</span>
            </button>
          ))}
        </div>
      </section>
      <section className={`setup-block ${language ? '' : 'setup-block-muted'}`}>
        <h2 className="setup-heading">
          <span className="setup-step">2</span> Difficulty
        </h2>
        {!language ? (
          <p className="setup-hint">Select a language above to unlock difficulty levels.</p>
        ) : (
          <div className="level-grid">
            {levels.map((lvl) => (
              <Link
                key={lvl.key}
                to={`/interview/run?level=${encodeURIComponent(lvl.key)}&lang=${encodeURIComponent(language)}`}
                className={`level-card ${lvl.accent}`}
              >
                <h2>{lvl.title}</h2>
                <p>{lvl.blurb}</p>
                <span className="level-cta">Begin →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default LevelSelectPage
