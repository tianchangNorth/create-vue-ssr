# create-vue-ssr

一个用于快速搭建 Vue SSR (服务端渲染) 项目的 CLI 工具。

## 特性

- 🚀 快速创建 Vue SSR 项目
- ⚡ 基于 Vite 构建工具
- 🎯 TypeScript 支持
- 📦 内置 Vue Router 和 Pinia 状态管理
- 🔧 开发环境热重载
- 📱 现代化的项目结构

## 使用方法

### 创建新项目

```bash
npm create vue-ssr
pnpm create vue-ssr
```

运行命令后，会提示你输入项目名称，然后自动创建项目目录并复制模板文件。

### 启动开发服务器

```bash
cd your-project-name
pnpm install
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
pnpm run start
```

## 项目结构

生成的项目包含以下结构：

```
your-project/
├── src/
│   ├── components/          # 组件目录
│   ├── views/              # 页面组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── hooks/              # 自定义 hooks
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   ├── main.ts             # 客户端入口
│   ├── entry-client.ts     # 客户端 SSR 入口
│   ├── entry-server.ts     # 服务端 SSR 入口
│   └── index.html          # HTML 模板
├── server/                 # Express 服务器
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── nodemon.json            # Nodemon 配置
└── package.json
```

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 的超集
- **Vue Router** - Vue.js 官方路由管理器
- **Pinia** - Vue 的状态管理库
- **Express** - Node.js Web 应用框架
- **Axios** - HTTP 客户端

## 可用脚本

在生成的项目中，你可以运行以下命令：

- `pnpm run dev` - 启动开发服务器
- `pnpm run build` - 构建生产版本
- `pnpm run start` - 启动生产服务器
- `pnpm run type-check` - TypeScript 类型检查

## SSR 特性

- **服务端渲染** - 提供更好的 SEO 和首屏加载性能
- **客户端激活** - 无缝的客户端交互体验
- **数据预取** - 支持服务端数据预取
- **状态同步** - 服务端和客户端状态自动同步

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

## 开发

如果你想为这个项目贡献代码：

```bash
git clone https://github.com/tianchangNorth/create-vue-ssr.git
cd create-vue-ssr
pnpm install
```

## 许可证

MIT

## 作者

tianchang

---

如果你觉得这个工具有用，请给个 ⭐ 支持一下！