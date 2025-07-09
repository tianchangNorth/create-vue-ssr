import prompts from 'prompts'
import { copy } from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { cwd } from 'process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function init() {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project name:',
    initial: 'my-vue-app'
  })

  const targetDir = path.join(cwd(), projectName)
  const templateDir = path.join(__dirname, 'templates', 'vue')

  console.log(`\n📁 Creating Vue project in: ${targetDir}`)
  await copy(templateDir, targetDir)

  console.log('✅ Done! Now run:')
  console.log(`\n  cd ${projectName}`)
  console.log('  pnpm install')
  console.log('  pnpm dev\n')
}