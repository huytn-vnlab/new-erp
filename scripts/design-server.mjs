import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { extname, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const PORT = 3001
const DESIGN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'design')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
}

createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  const filePath = join(DESIGN_DIR, urlPath === '/' ? 'Admin Dashboard.html' : urlPath)

  try {
    const data = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => {
  console.log(`Design server: http://localhost:${PORT}`)
})
