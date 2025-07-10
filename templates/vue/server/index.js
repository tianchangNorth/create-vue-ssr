import express from 'express'
import { fileURLToPath, URL } from 'node:url'
import { readFile } from 'node:fs/promises'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()

  let vite
  if (!isProduction) {
    // 开发环境
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    // 生产环境
    app.use(express.static('dist/client'))
  }

  app.use('{*path}', async (req, res, next) => {
    if (req.originalUrl.startsWith('/.well-known')) {
      return next()
    }
    
    try {
      const url = req.originalUrl

      let template
      let render
      
      if (!isProduction) {
        // 开发环境
        template = await readFile('./src/index.html', 'utf-8')
        template = await vite.transformIndexHtml(url, template)        
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
      } else {
        // 生产环境
        template = await readFile('./dist/client/index.html', 'utf-8')
        render = (await import('./dist/server/entry-server.js')).render
        manifest = JSON.parse(await readFile('./dist/client/ssr-manifest.json', 'utf-8'))
      }

      const context = {
        url,
        request: req,
        response: res
      }

      const { html, state, preload, meta, statusCode } = await render(context)

      const finalHtml = template
        .replace('{{%html%}}', html)
        .replace('{{%state%}}', state)
        .replace('{{%title%}}', meta.title)
        .replace('{{%description%}}', meta.description)
        .replace('{{%keywords%}}', meta.keywords)
        .replace('{{%:=preload%}}', preload)

      res.status(statusCode).set({ 'Content-Type': 'text/html' }).end(finalHtml)
    } catch (e) {
      if (!isProduction) {
        vite.ssrFixStacktrace(e)
      }
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  return app
}

createServer().then(app => {
  app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000')
  })
})
