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