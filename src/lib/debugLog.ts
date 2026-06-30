import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'debug-7a833e.log')
const INGEST_URL = 'http://127.0.0.1:7808/ingest/4782e802-7ce1-440b-bf9c-3a56950d1432'
const SESSION_ID = '7a833e'

interface DebugLogPayload {
  location: string
  message: string
  data?: Record<string, unknown>
  hypothesisId?: string
  runId?: string
}

export function debugLog(payload: DebugLogPayload): void {
  const entry = {
    sessionId: SESSION_ID,
    timestamp: Date.now(),
    ...payload,
  }

  try {
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`)
  } catch {
    // ignore file write errors
  }

  fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION_ID,
    },
    body: JSON.stringify(entry),
  }).catch(() => {})
}
