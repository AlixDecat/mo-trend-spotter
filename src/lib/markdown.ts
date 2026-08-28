import { totalScore } from './score'
import {
  ARCHETYPE_OPTIONS,
  ASPECT_OPTIONS,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  COMPOSITION_OPTIONS,
  CONTRAST_OPTIONS,
  DECISION_OPTIONS,
  EXHIBITOR_OPTIONS,
  FABRICATION_PROCESS_OPTIONS,
  HARD_TO_COPY_OPTIONS,
  POSITIONING_OPTIONS,
  PROPORTION_OPTIONS,
  SCENE_OPTIONS,
  SUPPORT_OPTIONS,
  TEXTURE_OPTIONS,
  labelFor,
  labelsFor,
  type Direction,
  type Observation,
} from '../types'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function line(label: string, value: string): string {
  if (!value) return ''
  if (value.includes('\n')) {
    const sub = value
      .split('\n')
      .filter((v) => v.trim())
      .map((v) => `  - ${v.trim()}`)
      .join('\n')
    return `- ${label} :\n${sub}\n`
  }
  return `- ${label} : ${value}\n`
}

export function observationTitle(obs: Observation): string {
  const brand = obs.brandName || 'Stand sans nom'
  const where = [obs.hall && `Hall ${obs.hall}`, obs.stand && `Stand ${obs.stand}`]
    .filter(Boolean)
    .join(' · ')
  return where ? `${brand} · ${where}` : brand
}

export function observationToMarkdown(o: Observation): string {
  let md = `# ${observationTitle(o)}\n\n`
  const meta = [
    o.date,
    o.salonName,
    o.country,
    labelFor(EXHIBITOR_OPTIONS, o.exhibitorType),
    labelFor(CATEGORY_OPTIONS, o.category),
    labelFor(POSITIONING_OPTIONS, o.perceivedPositioning),
  ]
    .filter(Boolean)
    .join(' · ')
  if (meta) md += `${meta}\n\n`
  if (o.signalOneLiner) md += `**Signal :** ${o.signalOneLiner}\n\n`
  const decision = labelFor(DECISION_OPTIONS, o.decision)
  if (decision || o.familySignal) {
    const parts = [
      decision ? `**Décision :** ${decision}` : '',
      o.familySignal ? `**Famille :** ${o.familySignal}` : '',
    ].filter(Boolean)
    md += `${parts.join(' · ')}\n\n`
  }
  const total = totalScore(o)
  if (total > 0) {
    const s = o.scoring
    md += `**Score : ${total}/25** (fit ${s.fitMaisonDedansDehors} · signature ${s.signatureHardToCopy} · collection ${s.collectionnable} · premium ${s.premiumAccessibleCredible} · B2B ${s.b2bReady})\n\n`
  }

  let section = ''
  section += line('Couleurs', labelsFor(COLOR_OPTIONS, o.palette.dominantColors).join(', '))
  section += line('Accent', labelFor(COLOR_OPTIONS, o.palette.accentColor))
  section += line('Contraste', labelFor(CONTRAST_OPTIONS, o.palette.contrastLevel))
  section += line('Aspect', labelsFor(ASPECT_OPTIONS, o.materialTexture.aspect).join(', '))
  section += line('Texture', labelsFor(TEXTURE_OPTIONS, o.materialTexture.texture).join(', '))
  section += line(
    'Procédé de fabrication',
    labelsFor(FABRICATION_PROCESS_OPTIONS, o.materialTexture.fabricationProcess ?? []).join(', '),
  )
  section += line(
    'Difficile à copier',
    labelsFor(HARD_TO_COPY_OPTIONS, o.materialTexture.hardToCopyWhy).join(', '),
  )
  section += line('Notes matière', o.materialTexture.notes)
  if (section) md += `## Palette et matière\n${section}\n`

  section = ''
  section += line('Archétypes', labelsFor(ARCHETYPE_OPTIONS, o.formsVolumes.archetype).join(', '))
  section += line('Proportions', labelFor(PROPORTION_OPTIONS, o.formsVolumes.proportions))
  section += line('Détails distinctifs', o.formsVolumes.distinctiveDetails)
  section += line('Scènes', labelsFor(SCENE_OPTIONS, o.indoorOutdoorUse.scenes).join(', '))
  section += line('Crédibilité dedans/dehors', o.indoorOutdoorUse.credibilityNotes)
  if (section) md += `## Formes et usage\n${section}\n`

  section = ''
  if (o.collectionSystem.coordinatedSeries) {
    const rule = labelFor(COMPOSITION_OPTIONS, o.collectionSystem.compositionRule)
    section += `- Série coordonnée : oui${rule ? ` (${rule})` : ''}\n`
  }
  section += line('Univers en 3 mots', o.collectionSystem.universe3Words)
  if (o.merchandisability.cornerIn3Seconds) section += '- Corner lisible en 3 secondes : oui\n'
  section += line('Supports vus', labelsFor(SUPPORT_OPTIONS, o.merchandisability.supportsSeen).join(', '))
  section += line('Idée de starter pack', o.merchandisability.starterPackIdea)
  if (section) md += `## Collection et merchandising\n${section}\n`

  section = ''
  section += line('Garder', o.transposition.keep)
  section += line('Écarter', o.transposition.discard)
  section += line('Règle de traduction', o.transposition.translationRule)
  section += line("Nom d'univers provisoire", o.transposition.provisionalUniverseName)
  if (section) md += `## Transposition\n${section}\n`

  return md
}

export function directionToMarkdown(d: Direction, sources: Observation[]): string {
  const avg =
    sources.length > 0
      ? Math.round((sources.reduce((sum, o) => sum + totalScore(o), 0) / sources.length) * 10) / 10
      : 0
  let md = `# Direction de collection : ${d.name || 'Sans nom'}\n\n`
  md += `Générée le ${fmtDate(d.updatedAt)} à partir de ${sources.length} observation${
    sources.length > 1 ? 's' : ''
  }${avg > 0 ? ` (score moyen ${avg}/25)` : ''}.\n\n`
  if (d.promise) md += `## Promesse\n${d.promise}\n\n`
  if (d.codes) md += `## 3 codes non négociables\n${d.codes}\n\n`
  const system =
    line('Formes', d.systemForms) +
    line('Tailles', d.systemSizes) +
    line('Finitions', d.systemFinishes) +
    line('Bundles', d.systemBundles)
  if (system) md += `## Système de collection\n${system}\n`
  if (d.scenes) md += `## Scènes d'usage dedans/dehors\n${d.scenes}\n\n`
  const merch =
    line('Idée corner', d.merchCorner) +
    line('Starter pack vitrine', d.merchPackVitrine) +
    line('Starter pack terrasse', d.merchPackTerrasse)
  if (merch) md += `## Merchandising\n${merch}\n`
  const diff = line('Vs industriels', d.diffIndustriels) + line('Vs premium patrimonial', d.diffPatrimonial)
  if (diff) md += `## Différenciation\n${diff}\n`
  if (sources.length > 0) {
    md += '## Observations sources\n'
    for (const o of sources) md += `- ${observationTitle(o)} : ${totalScore(o)}/25\n`
    md += '\n'
  }
  if (d.notes) md += `## Notes\n${d.notes}\n`
  return md
}
