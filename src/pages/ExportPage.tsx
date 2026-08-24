import { useEffect, useState } from 'react'
import {
  getSyncUrl,
  isValidSyncUrl,
  setSyncUrl,
  syncNow,
  testSync,
  useSyncState,
} from '../lib/cloudSync'
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

const SYNC_LABELS: Record<string, string> = {
  off: 'Non configurée',
  idle: 'Configurée',
  pending: 'Envoi prévu…',
  syncing: 'Envoi en cours…',
  ok: 'À jour',
  error: 'Erreur, nouvel essai automatique',
  offline: 'En attente de réseau',
}

function fmtTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function SyncSection() {
  const sync = useSyncState()
  const [urlDraft, setUrlDraft] = useState(getSyncUrl())
  const [busy, setBusy] = useState(false)

  function save() {
    const url = urlDraft.trim()
    if (url && !isValidSyncUrl(url)) {
      toast('URL invalide : elle doit commencer par https://script.google.com/', 'err')
      return
    }
    setSyncUrl(url)
    toast(url ? 'Sauvegarde Google Drive connectée' : 'Sauvegarde Google Drive désactivée')
  }

  async function runTest() {
    setBusy(true)
    try {
      const ok = await testSync()
      if (ok) {
        toast('Connexion au Drive réussie')
        void syncNow()
      } else {
        toast('Le script Google ne répond pas', 'err')
      }
    } finally {
      setBusy(false)
    }
  }

  const label = SYNC_LABELS[sync.status] ?? sync.status
  const time = fmtTime(sync.lastOkAt)

  return (
    <>
      <p className="mt-6 text-base font-bold">Sauvegarde automatique Google Drive</p>
      <p className="hint">
        Après chaque fiche, l'app envoie les données et les nouvelles photos dans le dossier
        « M&O Spotter - Sauvegardes » de votre Drive. Sans réseau, l'envoi part dès que la
        connexion revient.
      </p>
      <p className="card mt-2 text-sm">
        État : <span className="font-semibold">{label}</span>
        {sync.status === 'ok' && time ? ` (${time})` : ''}
      </p>
      <input
        className="input mt-2"
        value={urlDraft}
        placeholder="URL du script Google (https://script.google.com/…)"
        onChange={(e) => setUrlDraft(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn flex-1" onClick={save}>
          Enregistrer l'URL
        </button>
        <button type="button" className="btn flex-1" disabled={busy || !getSyncUrl()} onClick={() => void runTest()}>
          {busy ? 'Test…' : 'Tester'}
        </button>
      </div>
    </>
  )
}

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

      <SyncSection />

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
