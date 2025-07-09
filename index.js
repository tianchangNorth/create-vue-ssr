import prompts from 'prompts'
import { copy, ensureDir } from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { cwd } from 'process'
import cliProgress from 'cli-progress'
import { glob } from 'glob'
import fs from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function copyWithProgress(src, dest) {
  // 获取所有需要复制的文件
  const files = await glob('**/*', { 
    cwd: src, 
    nodir: true,
    dot: true 
  })
  
  if (files.length === 0) {
    console.log('⚠️  No files to copy')
    return
  }

  // 创建进度条
  const progressBar = new cliProgress.SingleBar({
    format: '📦 Copying files |{bar}| {percentage}% | {value}/{total} files | {filename}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: true
  })

  progressBar.start(files.length, 0, { filename: '' })

  // 逐个复制文件
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const srcFile = path.join(src, file)
    const destFile = path.join(dest, file)
    
    // 确保目标目录存在
    await ensureDir(path.dirname(destFile))
    
    // 复制文件
    await fs.copyFile(srcFile, destFile)
    
    // 更新进度条
    progressBar.update(i + 1, { 
      filename: file.length > 30 ? '...' + file.slice(-27) : file 
    })
  }

  progressBar.stop()
}

export async function init() {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project name:',
    initial: 'my-vue-app',
    validate: (value) => {
      if (!value.trim()) {
        return 'Project name is required'
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return 'Project name can only contain letters, numbers, hyphens and underscores'
      }
      return true
    }
  })

  if (!projectName) {
    console.log('\n❌ Operation cancelled')
    return
  }

  const targetDir = path.join(cwd(), projectName)
  const templateDir = path.join(__dirname, 'templates', 'vue')

  // 检查目标目录是否已存在
  try {
    await fs.access(targetDir)
    console.log(`\n❌ Directory '${projectName}' already exists`)
    return
  } catch {
    // 目录不存在，继续执行
  }

  console.log(`\n📁 Creating Vue SSR project in: ${targetDir}`)
  
  try {
    await copyWithProgress(templateDir, targetDir)
    
    console.log('\n✅ Project created successfully!')
    console.log('\n🚀 Next steps:')
    console.log(`\n  cd ${projectName}`)
    console.log('  pnpm install')
    console.log('  pnpm dev\n')
  } catch (error) {
    console.error('\n❌ Error creating project:', error.message)
    process.exit(1)
  }
}