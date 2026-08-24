import { useEffect, useState } from 'react'
import {
  buildCsv,
  buildFullZipBlob,
  buildJsonBlob,
  buildMarkdownZipBlob,
  importFromFile,
  requestPersistentStorage,
  shareOrDownload,
  storageInfo,
  today,
  type ImportReport,
  type ShareResult,
} from '../lib/export'
import { toast } from '../lib/toast'
import { seedExamples } from '../seed'
import { useObservations } from '../store'

export function ExportPage() {
  const { observations } = useObservations()
  const [report, setReport] = useState<ImportReport | null>(null)
  const [storage, setStorage] = useState<{ usageMb: number; quotaMb: number } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    void storageInfo().then(setStorage)
  }, [])

  async function run(key: string, fn: () => Promise<ShareResult>) {
    if (observations.length === 0) {
      toast('Aucune observation à exporter', 'err')
      return
    }
    setBusy(key)
    try {
      const result = await fn()
      if (result === 'downloaded') toast('Fichier téléchargé')
      else if (result === 'shared') toast('Fichier partagé')
    } catch {
      toast("Échec de l'export", 'err')
    } finally {
      setBusy(null)
    }
  }

  async function onImport(file: File | undefined) {
    if (!file) return
    setBusy('import')
    try {
      const r = await importFromFile(file)
      setReport(r)
      toast(`Import terminé : ${r.added} ajoutée(s), ${r.updated} mise(s) à jour`)
    } catch {
      toast('Fichier illisible ou invalide', 'err')
    } finally {
      setBusy(null)
    }
  }

  async function persist() {
    const granted = await requestPersistentStorage()
    toast(granted ? 'Stockage protégé par le navigateur' : 'Protection non accordée', granted ? 'ok' : 'err')
  }

  function ExportButton({
    id,
    label,
    sub,
    primary,
    action,
  }: {
    id: string
    label: string
    sub: string
    primary?: boolean
    action: () => Promise<ShareResult>
  }) {
    return (
      <button
        type="button"
        className={`btn mt-2 w-full flex-col items-start gap-0 py-3 ${primary ? 'btn-primary' : ''}`}
        disabled={busy !== null}
        onClick={() => void run(id, action)}
      >
        <span className="w-full text-left">{busy === id ? 'Préparation…' : label}</span>
        <span className={`w-full text-left text-xs font-normal ${primary ? 'text-white/85' : 'text-ink-500'}`}>
          {sub}
        </span>
      </button>
    )
  }

  return (
    <div className="pt-4">
      <p className="h1">Export et sauvegarde</p>
      <p className="mt-1 text-xs text-ink-500">
        Tout est stocké sur ce téléphone. Faites une sauvegarde chaque soir du salon.
      </p>

      <ExportButton
        id="json"
        primary
        label="Sauvegarde JSON"
        sub="Toutes les données en 1 tap (sans les photos)"
        action={() => shareOrDownload(`observations-mo-${today()}.json`, buildJsonBlob(observations))}
      />
      <ExportButton
        id="zip"
        label="Sauvegarde complète (ZIP)"
        sub="Données + photos, réimportable sur un autre appareil"
        action={async () =>
          shareOrDownload(`sauvegarde-mo-${today()}.zip`, await buildFullZipBlob(observations))
        }
      />
      <ExportButton
        id="csv"
        label="Export CSV"
        sub="Tableau pour Excel (colonnes principales + scores)"
        action={() =>
          shareOrDownload(
            `observations-mo-${today()}.csv`,
            new Blob([buildCsv(observations)], { type: 'text/csv;charset=utf-8' }),
          )
        }
      />
      <ExportButton
        id="md"
        label="Résumés Markdown (ZIP)"
        sub="Un fichier .md par observation, à coller dans Notion ou un mail"
        action={async () =>
          shareOrDownload(`resumes-mo-${today()}.zip`, await buildMarkdownZipBlob(observations))
        }
      />

      <p className="mt-6 text-base font-bold">Importer une sauvegarde</p>
      <p className="hint">JSON ou ZIP. Fusion par fiche : la version la plus récente gagne.</p>
      <label className={`btn mt-2 w-full ${busy === 'import' ? 'opacity-60' : ''}`}>
        {busy === 'import' ? 'Import en cours…' : 'Choisir un fichier…'}
        <input
          type="file"
          accept=".json,.zip,application/json,application/zip"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            void onImport(file)
          }}
        />
      </label>
      {report ? (
        <p className="card mt-2 text-sm">
          {report.added} ajoutée(s) · {report.updated} mise(s) à jour · {report.skipped} inchangée(s)
          {report.photosAdded > 0 ? ` · ${report.photosAdded} photo(s)` : ''}
        </p>
      ) : null}

      <p className="mt-6 text-base font-bold">Stockage</p>
      <div className="card mt-2 text-sm">
        {storage ? (
          <p>
            {storage.usageMb < 1 ? '< 1' : Math.round(storage.usageMb)} Mo utilisés
            {storage.quotaMb > 0 ? ` sur environ ${Math.round(storage.quotaMb / 1024)} Go disponibles` : ''}
          </p>
        ) : (
          <p className="text-ink-500">Estimation indisponible</p>
        )}
        <button type="button" className="btn mt-2 w-full" onClick={() => void persist()}>
          Protéger le stockage
        </button>
        <p className="hint mt-1">
          Demande au navigateur de ne jamais effacer les données de l'app automatiquement.
        </p>
      </div>

      <p className="mt-6 text-base font-bold">Exemples</p>
      <button
        type="button"
        className="btn mt-2 w-full"
        onClick={() => void seedExamples().then((n) => toast(`${n} exemples ajoutés (supprimables)`))}
      >
        Charger 2 observations d'exemple
      </button>
      <div className="h-6" />
    </div>
  )
}
