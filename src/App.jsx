import { useMemo, useRef, useState } from 'react'

const TOGETHER_MODEL = 'black-forest-labs/FLUX.1-schnell-Free'
const TOGETHER_API_KEY =
  import.meta.env.VITE_TOGETHER_API_KEY ||
  'd9bc21bb4dccafd70d81a9359655be41176e08d8db07f00ea2a0dfbbd5024afe'

const shotTypes = [
  'Close-up',
  'Medium shot',
  'Full body',
  'Wide shot',
  'Macro',
]

const cameraAngles = ['Eye-level', 'Low angle', 'High angle', 'Overhead', 'Dutch angle']

const moods = ['Joyful', 'Serene', 'Confident', 'Dramatic', 'Thoughtful']

const styles = ['Editorial', 'Streetwear', 'Cyber/futuristic', 'Vintage film', 'Minimal']

const environments = [
  'Urban street at golden hour',
  'Futuristic city',
  'Café interior',
  'Studio seamless',
  'Forest path',
]

const lightingModes = [
  'Soft backlight',
  'Rim light',
  'Golden-hour glow',
  'Neon reflections',
  'Window light',
]

const colorGrades = ['Warm tones', 'Cool tones', 'Teal and orange', 'Muted cinematic', 'Vibrant']

const lenses = ['50mm f1.8', '85mm f1.8', '35mm f2.0', '105mm macro', 'Anamorphic flare']

const aspectRatios = ['1:1', '3:4', '16:9']

const paletteModes = ['Análoga', 'Complementar', 'Triádica']

const presets = [
  {
    name: 'Neon futurista',
    description: 'Retrato editorial com neon, contrastes fortes e rim light.',
    values: {
      idea: 'Retrato editorial futurista com neon violeta e ciano em ambiente urbano.',
      subject: 'Retrato cyberpunk com displays holográficos',
      shotType: 'Medium shot',
      cameraAngle: 'Eye-level',
      mood: 'Confident',
      style: 'Cyber/futuristic',
      environment: 'Futuristic city',
      colorGrade: 'Teal and orange',
      lighting: 'Neon reflections',
      lens: '85mm f1.8',
      aspectRatio: '3:4',
      paletteMode: 'Complementar',
      accent: '#7c3aed',
      negatives: 'ruído, borrado, proporções estranhas, watermark',
    },
  },
  {
    name: 'Café minimalista',
    description: 'Cena serena com palette quente e luz de janela.',
    values: {
      idea: 'Cena calma de barista artesanal em cafeteria minimalista.',
      subject: 'Barista preparando café V60 com cuidado',
      shotType: 'Medium shot',
      cameraAngle: 'Eye-level',
      mood: 'Serene',
      style: 'Minimal',
      environment: 'Café interior',
      colorGrade: 'Warm tones',
      lighting: 'Window light',
      lens: '50mm f1.8',
      aspectRatio: '3:4',
      paletteMode: 'Análoga',
      accent: '#d97706',
      negatives: 'grão alto, sombras duras, pessoas extras',
    },
  },
  {
    name: 'Natureza mística',
    description: 'Mood contemplativo, florestas e luz dourada.',
    values: {
      idea: 'Figura solitária caminhando por floresta enevoada com raios de sol.',
      subject: 'Explorador em floresta com raios de sol filtrados',
      shotType: 'Wide shot',
      cameraAngle: 'Low angle',
      mood: 'Dramatic',
      style: 'Vintage film',
      environment: 'Forest path',
      colorGrade: 'Muted cinematic',
      lighting: 'Golden-hour glow',
      lens: '35mm f2.0',
      aspectRatio: '16:9',
      paletteMode: 'Triádica',
      accent: '#0ea5e9',
      negatives: 'neblina exagerada, flare excessivo, figuras duplas',
    },
  },
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function hexToHsl(hex) {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2
    else h = (rNorm - gNorm) / delta + 4
  }

  h = Math.round(h * 60)
  if (h < 0) h += 360

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return { h, s, l }
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  const toHex = (channel) => {
    const hex = Math.round((channel + m) * 255)
    return clamp(hex, 0, 255).toString(16).padStart(2, '0')
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function shiftHue(hex, degrees) {
  const { h, s, l } = hexToHsl(hex)
  const newHue = (h + degrees + 360) % 360
  return hslToHex(newHue, s, l)
}

function buildPalette(base, mode) {
  switch (mode) {
    case 'Complementar':
      return [base, shiftHue(base, 180)]
    case 'Triádica':
      return [base, shiftHue(base, 120), shiftHue(base, -120)]
    default:
      return [base, shiftHue(base, 20), shiftHue(base, -20)]
  }
}

function buildPrompt({
  subject,
  shotType,
  cameraAngle,
  mood,
  style,
  environment,
  colorGrade,
  lighting,
  lens,
  aspectRatio,
  negatives,
  palette,
}) {
  const beginning = subject || 'A striking subject in motion'

  const middleParts = [
    shotType,
    cameraAngle,
    mood,
    style,
    environment,
    colorGrade && `${colorGrade} palette`,
    palette.length ? `colors ${palette.join(', ')}` : null,
  ].filter(Boolean)

  const endParts = [lighting, lens, `ar ${aspectRatio}`, `negative: ${negatives}`].filter(Boolean)

  return `${beginning} — ${middleParts.join(', ')} — ${endParts.join(', ')}`
}

export default function App() {
  const currentYear = new Date().getFullYear()
  const [idea, setIdea] = useState(
    'Retrato editorial futurista com toque humano e neon, linguagem acessível.',
  )
  const [subject, setSubject] = useState(
    'Futuristic prompt designer guiding an AI assistant with holographic panels',
  )
  const [shotType, setShotType] = useState('Medium shot')
  const [cameraAngle, setCameraAngle] = useState('Eye-level')
  const [mood, setMood] = useState('Confident')
  const [style, setStyle] = useState('Cyber/futuristic')
  const [environment, setEnvironment] = useState('Futuristic city')
  const [colorGrade, setColorGrade] = useState('Teal and orange')
  const [lighting, setLighting] = useState('Rim light')
  const [lens, setLens] = useState('85mm f1.8')
  const [aspectRatio, setAspectRatio] = useState('3:4')
  const [negatives, setNegatives] = useState(
    'blurry, overexposed, watermark, extra fingers, bad anatomy',
  )
  const [accent, setAccent] = useState('#7c3aed')
  const [paletteMode, setPaletteMode] = useState('Análoga')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isIdeaGenerating, setIsIdeaGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [ideaError, setIdeaError] = useState('')

  const palette = useMemo(() => buildPalette(accent, paletteMode), [accent, paletteMode])

  const prompt = useMemo(
    () =>
      buildPrompt({
        subject,
        shotType,
        cameraAngle,
        mood,
        style,
        environment,
        colorGrade,
        lighting,
        lens,
        aspectRatio,
        negatives,
        palette,
      }),
    [
      subject,
      shotType,
      cameraAngle,
      mood,
      style,
      environment,
      colorGrade,
      lighting,
      lens,
      aspectRatio,
      negatives,
      palette,
    ],
  )

  const colorWheelGradient = useMemo(() => {
    const steps = Array.from({ length: 12 }).map((_, idx) => idx * 30)
    const stops = steps.map(
      (step) => `${hslToHex(step, 0.72, 0.58)} ${(step / 360) * 100}%`,
    )
    return `conic-gradient(${stops.join(', ')})`
  }, [])

  const knobOffset = useMemo(() => {
    const { h } = hexToHsl(accent)
    const angleRad = ((h - 90) * Math.PI) / 180
    const radius = 68
    const x = Math.cos(angleRad) * radius
    const y = Math.sin(angleRad) * radius
    return { x, y }
  }, [accent])

  const handleAccentChange = (event) => setAccent(event.target.value)

  const applyIdeaToSubject = (ideaText) => {
    const condensed = ideaText.trim()
    if (!condensed) return
    const words = condensed.split(/[,.;]/)
    const baseSubject = words[0]
    setSubject(baseSubject.charAt(0).toUpperCase() + baseSubject.slice(1))
  }

  const handleIdeaApply = () => applyIdeaToSubject(idea)

  const handleGenerateIdea = async () => {
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY
    if (!apiKey) {
      setIdeaError('Defina VITE_TOGETHER_API_KEY no ambiente para gerar textos.')
      return
    }

    setIsIdeaGenerating(true)
    setIdeaError('')

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'ServiceNow-AI/Apriel-1.5-15b-Thinker',
          messages: [
            {
              role: 'system',
              content:
                'Você cria ideias curtas em português para gerar prompts visuais. Retorne apenas uma ideia concisa.',
            },
            {
              role: 'user',
              content:
                'Sugira uma ideia curta, criativa e específica para gerar imagens de IA. Mencione personagem, ação e ambiente.',
            },
          ],
          temperature: 0.8,
          max_tokens: 150,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result?.error?.message || 'Falha ao gerar texto. Tente novamente.'
        throw new Error(message)
      }

      const generated = result?.choices?.[0]?.message?.content?.trim()
      if (!generated) {
        throw new Error('Resposta da IA não trouxe um texto utilizável.')
      }

      setIdea(generated)
      applyIdeaToSubject(generated)
    } catch (error) {
      setIdeaError(error.message)
    } finally {
      setIsIdeaGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!prompt) return

    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY
    if (!apiKey) {
      setErrorMessage('Defina VITE_TOGETHER_API_KEY no ambiente para gerar imagens.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: TOGETHER_MODEL,
          prompt,
          disable_safety_checker: false,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        const message = result?.error?.message || 'Falha ao gerar imagem. Tente novamente.'
        throw new Error(message)
      }

      const candidate =
        result?.data?.[0]?.url || result?.data?.[0]?.b64_json || result?.data?.[0]?.image_base64

      if (!candidate) {
        throw new Error('Resposta da API não trouxe uma imagem utilizável.')
      }

      const asDataUri = candidate.startsWith('http')
        ? candidate
        : `data:image/png;base64,${candidate}`

      setImageUrl(asDataUri)
    } catch (error) {
      setErrorMessage(error.message)
      setImageUrl('')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="page" style={{ '--accent': accent }}>
      <div className="background-glow" aria-hidden>
        <span className="glow glow-1" />
        <span className="glow glow-2" />
        <span className="glow glow-3" />
      </div>
      <header className="hero">
        <div>
          <p className="eyebrow">PromptLab Studio • V1</p>
          <h1>Construa prompts prontos para MidJourney, SD e DALL·E</h1>
          <p className="lede">
            Combine ideia vaga, cores e estilo visual. A página já monta um prompt limpo usando a
            estrutura <strong>[beginning] [middle] [end]</strong>, com espaço para palette e negatives.
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => {
                handleIdeaApply()
                scrollToSection(subjectRef)
              }}
            >
              Aplicar ideia vaga
            </button>
            <button className="ghost" type="button" onClick={() => scrollToSection(presetsRef)}>
              Explorar presets
            </button>
          </div>
          <div className="stats">
            <div>
              <span className="stat-number">12</span>
              <span className="stat-label">categorias visuais</span>
            </div>
            <div>
              <span className="stat-number">∞</span>
              <span className="stat-label">combinações</span>
            </div>
            <div>
              <span className="stat-number">1</span>
              <span className="stat-label">prompt paste-ready</span>
            </div>
          </div>
        </div>
          <div className="preview-card">
            <div className="badge">Palette</div>
            <div
              className="color-wheel interactive"
              style={{ background: colorWheelGradient }}
              onClick={handleWheelClick}
              role="button"
              aria-label="Selecionar cor principal pela roda"
              tabIndex={0}
            >
              <span
                className="color-knob"
                style={{ transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)` }}
              />
            </div>
          <div className="swatches">
            {palette.map((color) => (
              <div key={color} className="swatch" style={{ backgroundColor: color }} />
            ))}
          </div>
          <p className="preview-label">Harmonia {paletteMode}</p>
          <p className="mini">Um ponto de partida visual rápido para o prompt.</p>
          <div className="preview-legend">
            <span>Cor base</span>
            <span>Contraste</span>
            <span>Acabamento</span>
          </div>
        </div>
      </header>

      <main className="grid">
        <section className="card wide">
          <div className="card-header">
            <div>
              <p className="eyebrow">1. Ideia vaga</p>
              <h2>Contexto em português</h2>
            </div>
            <button
              className="ghost"
              type="button"
              onClick={handleGenerateIdea}
              disabled={isIdeaGenerating}
            >
              {isIdeaGenerating ? 'Gerando com IA...' : 'Gerar assunto'}
            </button>
          </div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Descreva o que deseja ver..."
          />
          <p className="helper">Aplicar ideia vaga define o assunto do prompt automaticamente.</p>
          {ideaError ? <p className="error-text">{ideaError}</p> : null}
        </section>

        <section className="card" ref={subjectRef}>
          <p className="eyebrow">2. Assunto</p>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujeito + ação essencial"
          />
          <div className="chips">
            {['Portrait', 'Duo', 'Cena narrativa', 'Produto'].map((chip) => (
              <button key={chip} type="button" className="chip" onClick={() => setSubject(chip)}>
                {chip}
              </button>
            ))}
          </div>
        </section>

        <section className="card" ref={presetsRef}>
          <div className="card-header">
            <div>
              <p className="eyebrow">Presets</p>
              <h2>Combinações rápidas</h2>
              <p className="mini">Aplique um pacote completo de ideia, mood, lente e paleta.</p>
            </div>
          </div>
          <div className="preset-grid">
            {presets.map((preset) => (
              <div key={preset.name} className="preset-card">
                <div className="preset-top">
                  <span className="badge subtle">{preset.name}</span>
                  <div
                    className="preset-color"
                    style={{ background: preset.values.accent }}
                    aria-hidden
                  />
                </div>
                <p className="mini">{preset.description}</p>
                <div className="preset-meta">
                  <span>{preset.values.style}</span>
                  <span>{preset.values.environment}</span>
                  <span>{preset.values.lighting}</span>
                </div>
                <button className="ghost" type="button" onClick={() => applyPreset(preset)}>
                  Aplicar preset
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">3. Enquadramento</p>
          <div className="field">
            <label>Shot type</label>
            <select value={shotType} onChange={(e) => setShotType(e.target.value)}>
              {shotTypes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Camera angle</label>
            <select value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)}>
              {cameraAngles.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Lens</label>
            <select value={lens} onChange={(e) => setLens(e.target.value)}>
              {lenses.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">4. Estilo e mood</p>
          <div className="field">
            <label>Emoção</label>
            <div className="chips">
              {moods.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip ${option === mood ? 'active' : ''}`}
                  onClick={() => setMood(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Estética</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              {styles.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Ambiente</label>
            <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
              {environments.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">5. Cor e luz</p>
          <div className="color-picker">
            <div className="field-inline">
              <label>Cor principal</label>
              <input type="color" value={accent} onChange={handleAccentChange} />
              <div className="accent-preview">{accent}</div>
            </div>
            <p className="mini">Clique na roda ou ajuste o hex para mudar a cor base.</p>
            <div
              className="color-wheel interactive"
              style={{ background: colorWheelGradient }}
              onClick={handleWheelClick}
              role="button"
              aria-label="Selecionar cor principal pela roda"
              tabIndex={0}
            >
              <span
                className="color-knob"
                style={{ transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)` }}
              />
            </div>
            <div className="palette-mode">
              {paletteModes.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip ${option === paletteMode ? 'active' : ''}`}
                  onClick={() => setPaletteMode(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="swatches large">
            {palette.map((color) => (
              <div key={color} className="swatch" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="field">
            <label>Color grading</label>
            <select value={colorGrade} onChange={(e) => setColorGrade(e.target.value)}>
              {colorGrades.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Iluminação</label>
            <select value={lighting} onChange={(e) => setLighting(e.target.value)}>
              {lightingModes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="card">
          <p className="eyebrow">6. Aspecto final</p>
          <div className="field">
            <label>Aspect ratio</label>
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              {aspectRatios.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Negatives</label>
            <textarea value={negatives} onChange={(e) => setNegatives(e.target.value)} />
          </div>
        </section>

        <section className="card wide highlight">
          <div className="card-header">
            <div>
              <p className="eyebrow">7. Prompt final</p>
              <h2>Pronto para colar no gerador</h2>
            </div>
            <div className="pill">Estrutura: [beginning] [middle] [end]</div>
          </div>
          <div className="prompt-box">
            <p>{prompt}</p>
          </div>
          <div className="prompt-meta">
            <span>Shot: {shotType}</span>
            <span>Ângulo: {cameraAngle}</span>
            <span>Lens: {lens}</span>
            <span>AR: {aspectRatio}</span>
          </div>
          <div className="cta-row">
            <button className="primary" type="button">
              Copiar prompt
            </button>
            <button className="ghost" type="button" onClick={handleGenerateImage} disabled={isGenerating}>
              {isGenerating ? 'Gerando imagem...' : 'Gerar imagem'}
            </button>
          </div>
          <div className="generation-status">
            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            {!errorMessage && imageUrl ? (
              <div className="image-preview">
                <p className="eyebrow">Prévia Together</p>
                <img src={imageUrl} alt="Imagem gerada pela Together" />
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-content">
          <div>
            <p className="footer-title">PromptLab Studio</p>
            <p className="footer-subtitle">Criado por Guilherme Zanini de Sá</p>
          </div>
          <div className="footer-meta">
            <span>© {currentYear} Guilherme Zanini de Sá. Todos os direitos reservados.</span>
            <span className="footer-divider">•</span>
            <span>Feito com amor por prompts e design.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
