# Vue SSR App

一个基于 Vue 3 + TypeScript + Vite 的服务端渲染 (SSR) 应用。

## 📁 项目结构

```
vue-ssr-app/
├── public/                 # 静态资源
│   └── favicon.ico
├── server/                 # 服务器代码
│   └── index.js           # Express 服务器入口
├── src/                   # 源代码
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   └── About.vue      # 关于页面
│   ├── stores/            # Pinia 状态管理
│   │   ├── app.ts         # 应用状态
│   │   └── prefetch.ts    # 预取数据状态
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义
│   ├── hooks/             # 组合式函数
│   │   └── async-data.ts  # 异步数据钩子
│   ├── utils/             # 工具函数
│   │   └── fetch.ts       # 请求工具
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   ├── entry-client.ts    # 客户端入口
│   ├── entry-server.ts    # 服务端入口
│   └── env.d.ts           # 类型声明
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── nodemon.json           # Nodemon 配置
```

## 🛠️ 技术栈

- **前端框架**: Vue 3.5.0
- **构建工具**: Vite 6.0.0
- **语言**: TypeScript 5.0.0
- **路由**: Vue Router 4.5.1
- **状态管理**: Pinia 3.0.0
- **服务器**: Express 5.0.0
- **HTTP 客户端**: Axios 1.10.0
- **开发工具**: Nodemon 3.0.0

## 📦 安装依赖

```bash
# 使用 npm
npm install

# 使用 pnpm (推荐)
pnpm install

# 使用 yarn
yarn install
```

## 🚀 开发

启动开发服务器：

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 🏗️ 构建

构建生产版本：

```bash
npm run build
```

这将会：
1. 构建客户端代码到 `dist/client`
2. 构建服务端代码到 `dist/server`

## 🌐 生产部署

启动生产服务器：

```bash
npm run start
```

## 📝 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run build:client` - 仅构建客户端
- `npm run build:server` - 仅构建服务端
- `npm run start` - 启动生产服务器
- `npm run type-check` - TypeScript 类型检查

## 🎯 功能特点

### SSR 渲染
- 服务端渲染提升 SEO 和首屏加载速度
- 自动处理客户端和服务端的状态同步
- 支持预加载资源优化

### 状态管理
- 使用 Pinia 进行状态管理
- 支持服务端状态序列化和客户端恢复
- 响应式状态更新

### 路由系统
- 基于 Vue Router 4 的路由管理
- 支持路由元信息 (meta)
- 自动代码分割和懒加载

### 开发体验
- 热重载开发环境
- TypeScript 完整支持
- 现代化的构建工具链

## 数据获取

### useAsyncData

`useAsyncData` 是一个强大的组合式函数，用于在 SSR 环境中处理异步数据获取。它支持服务端预取、客户端激活、缓存等功能。

#### 基本用法

```vue
<script setup lang="ts">
import { useAsyncData } from '@/hooks/async-data'
import { $fetch } from '@/utils/fetch'

// 基本用法
const { data, pending, refresh, reset } = useAsyncData('user-info', async () => {
  return await $fetch('/api/user/info')
})
</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="data">
      <h2>{{ data.name }}</h2>
      <p>{{ data.email }}</p>
    </div>
    <button @click="refresh">刷新数据</button>
  </div>
</template>
```

#### 高级选项

```typescript
const { data, pending, refresh } = useAsyncData('posts', async () => {
  return await $fetch('/api/posts')
}, {
  // 默认值
  default: () => [],
  
  // 是否在服务端执行
  server: true,
  
  // 是否缓存结果
  cache: true,
  
  // 数据转换
  transform: (data) => data.map(item => ({ ...item, formatted: true })),
  
  // 只选择特定字段
  pick: ['id', 'title', 'content'],
  
  // 监听响应式数据变化
  watch: [searchQuery, currentPage],
  
  // 处理完成后的回调
  onAfterHandle: ({ handleSuccess, serverContext }) => {
    if (!handleSuccess) {
      console.error('数据获取失败')
    }
  }
})
```

#### 批量数据获取

```typescript
// 同时获取多个数据源
const [userResult, postsResult, settingsResult] = useAsyncData(
  {
    key: 'user',
    handler: () => $fetch('/api/user'),
    options: { cache: true }
  },
  {
    key: 'posts',
    handler: () => $fetch('/api/posts'),
    options: { default: () => [] }
  },
  {
    key: 'settings',
    handler: () => $fetch('/api/settings'),
    options: { server: false } // 仅在客户端执行
  }
)
```

### $fetch 工具函数

`$fetch` 是基于 Axios 封装的 HTTP 客户端，提供了统一的错误处理和响应格式。

#### 基本用法

```typescript
import { $fetch } from '@/utils/fetch'

// GET 请求
const result = await $fetch('/api/users', {
  method: 'get',
  data: { page: 1, limit: 10 }
})

// POST 请求
const result = await $fetch('/api/users', {
  method: 'post',
  data: { name: 'John', email: 'john@example.com' }
})

// 处理响应
if (result.isSuccess) {
  console.log('数据:', result.data)
} else {
  console.error('错误:', result.msg)
}
```

#### 高级选项

```typescript
// 文件上传
const uploadResult = await $fetch('/api/upload', {
  method: 'post',
  upload: true,
  data: {
    file: fileInput.files[0],
    description: '文件描述'
  },
  onUploadPercent: (percent) => {
    console.log(`上传进度: ${percent}%`)
  }
})

// 下载文件
const blobResult = await $fetch('/api/download/file.pdf', {
  method: 'get',
  responseType: 'blob'
})

// 自定义请求头
const result = await $fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Custom-Header': 'value'
  }
})

// 禁用缓存
const result = await $fetch('/api/real-time-data', {
  cache: false
})
```

#### 响应格式

```typescript
interface FetchResult {
  isSuccess: boolean    // 请求是否成功
  code: number | string // 状态码
  msg?: string         // 消息
  data?: any          // 响应数据
  $response?: any     // 原始响应对象
}
```

### 实际应用示例

#### 用户列表页面

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncData } from '@/hooks/async-data'
import { $fetch } from '@/utils/fetch'

const searchQuery = ref('')
const currentPage = ref(1)

// 获取用户列表，支持搜索和分页
const { data: users, pending, refresh } = useAsyncData('users', async () => {
  return await $fetch('/api/users', {
    method: 'get',
    data: {
      search: searchQuery.value,
      page: currentPage.value,
      limit: 10
    }
  })
}, {
  default: () => ({ list: [], total: 0 }),
  watch: [searchQuery, currentPage],
  transform: (data) => ({
    list: data.list || [],
    total: data.total || 0
  })
})

// 删除用户
const deleteUser = async (id: number) => {
  const result = await $fetch(`/api/users/${id}`, {
    method: 'delete'
  })
  
  if (result.isSuccess) {
    await refresh() // 刷新列表
  }
}
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索用户..." />
    
    <div v-if="pending">加载中...</div>
    
    <div v-else>
      <div v-for="user in users.list" :key="user.id">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <button @click="deleteUser(user.id)">删除</button>
      </div>
      
      <div>总计: {{ users.total }} 用户</div>
    </div>
  </div>
</template>
```

### 最佳实践

1. **使用唯一的 key**：确保每个 `useAsyncData` 调用都有唯一的 key
2. **合理使用缓存**：对于不经常变化的数据启用缓存
3. **错误处理**：始终检查 `isSuccess` 状态
4. **加载状态**：使用 `pending` 提供良好的用户体验
5. **数据转换**：使用 `transform` 选项处理服务端数据格式
6. **监听依赖**：使用 `watch` 选项自动刷新数据

### 注意事项

- 在开发环境中，重复的 key 会产生警告
- `server: false` 的请求只在客户端执行
- 使用 `cache: false` 可以禁用特定请求的缓存
- 文件上传时设置 `upload: true` 会自动处理 FormData

## 🔧 配置说明

### Vite 配置
- 启用 SSR 清单生成
- 配置路径别名 `@` 指向 `src` 目录
- Vue 插件集成

### TypeScript 配置
- 严格模式启用
- 路径映射配置
- 现代 ES 模块支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题，请提交 Issue 或联系项目维护者。