// Web / Standalone PWA stub for mobile bridge.
// Legacy Capacitor native shells have been removed; MOBILE is permanently false.
// Pure calculation functions (reminders, nudges) and safe browser fallbacks are preserved.
import { t, tn } from './i18n-core.js'
import { isoOf } from './format.js'
import { effectiveRoutineIds } from './history.js'
import { NUDGE_COPY, lineIndex, nudgeFor, nudgeMinute, toneOf } from './nudge.js'
import { excusedOn } from './day-notes.js'

export const MOBILE = false

export async function isAndroid() {
  return false
}

export async function nativePlatform() {
  return null
}

export async function nativeLoad() {
  return null
}

export async function nativeSave(_state) {
  // Web builds rely on browser localStorage and IndexedDB
}

export async function readJsonFile(_name) {
  return null
}

export async function writeJsonFile(_name, _data) {
  // No-op on web
}

export async function loadRemoteFile() {
  return null
}

export async function saveRemoteFile(_data) {
  // No-op on web
}

// Keep enough dates queued to cover normal app use between foregrounds without creating an
// unbounded notification list.
export const REMINDER_WINDOW_DAYS = 60
const REMINDER_ID_BASE = 1000

export function buildReminderNotifications(S, now = new Date()) {
  const r = S?.reminder
  if (!r?.on) return []
  const routines = Array.isArray(S.routines) ? S.routines : []
  const completed = new Set((S.workouts || []).map(w => w.d))
  const state = { ...S, routines, week: S.week || {}, dayPlan: S.dayPlan || {} }
  const [hour, minute] = (r.time || '08:00').split(':').map(Number)
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return []
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const notifications = []
  for (let offset = 0; offset < REMINDER_WINDOW_DAYS; offset++) {
    const day = new Date(date)
    day.setDate(date.getDate() + offset)
    const iso = isoOf(day)
    if (completed.has(iso) || excusedOn(S, iso)) continue
    const dayRoutines = effectiveRoutineIds(state, iso, iso).map(id => routines.find(x => x.id === id)).filter(Boolean)
    if (!dayRoutines.length) continue
    const label = dayRoutines.length <= 2 ? dayRoutines.map(r => r.name).join(' + ') : tn('{0} routine', '{0} routines', dayRoutines.length)
    const at = new Date(day)
    at.setHours(hour, minute, 0, 0)
    if (at <= now) continue
    notifications.push({
      id: REMINDER_ID_BASE + offset,
      title: t('Workout day'),
      body: t('{0} is on the plan today. Let’s go!', label),
      schedule: { at, allowWhileIdle: true },
    })
  }
  return notifications
}

export const NUDGE_WINDOW_DAYS = 7
const NUDGE_ID_BASE = 2000

export function buildNudgeNotifications(S, now = new Date()) {
  const r = S?.reminder
  if (!r?.on || !r.nudge) return []
  const at = nudgeMinute(r.time || '08:00')
  if (at == null) return []
  const routines = Array.isArray(S.routines) ? S.routines : []
  const copy = NUDGE_COPY[toneOf(r)]
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const notifications = []
  for (let offset = 0; offset < NUDGE_WINDOW_DAYS; offset++) {
    const day = new Date(date)
    day.setDate(date.getDate() + offset)
    const iso = isoOf(day)
    if (offset === 0 && S.active) continue
    const ids = nudgeFor(S, iso)
    if (!ids) continue
    const names = ids.map(id => routines.find(x => x.id === id)?.name).filter(Boolean)
    const label = names.length && names.length <= 2 ? names.join(' + ') : tn('{0} routine', '{0} routines', ids.length)
    const when = new Date(day)
    when.setHours(Math.floor(at / 60), at % 60, 0, 0)
    if (when <= now) continue
    notifications.push({
      id: NUDGE_ID_BASE + offset,
      title: t(copy.title),
      body: t(copy.lines[lineIndex(iso, copy.lines.length)], label),
      schedule: { at: when, allowWhileIdle: true },
    })
  }
  return notifications
}

export async function syncReminder(_S, _interactive = false) {
  // Web uses Web Push or in-app reminders; native local notifications are off
}

export function initReminderSync(_getState) {
  return () => {}
}

export function onAppActive(_cb) {
  return () => {}
}

export async function shareExport(json, filename) {
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([json], filename, { type: 'application/json' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
    } catch { /* fallback to browser download */ }
  }
  if (typeof document !== 'undefined') {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

export async function shareExportBlob(blob, filename) {
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
    } catch { /* fallback to browser download */ }
  }
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }
}

export async function printHtml(html) {
  if (typeof window !== 'undefined') {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
    }
  }
}

export const AUTO_BACKUP_DIR = 'openGym'
export const AUTO_BACKUP_KEEP = 14

export async function writeAutoBackup(_state) {
  // No-op on web
}

export const BACKUP_FOLDER_FILE = 'opengym-backup-folder.json'

export async function backupFolder() {
  return {}
}

export function onBackupFolderChange(_fn) {
  return () => {}
}

export async function chooseBackupFolder() {
  return null
}

export async function resetBackupFolder() {
  return {}
}

export function _resetBackupFolder() {}
