import { createApp } from './main'

const { app, router, pinia } = createApp()

// 恢复服务端状态
if (window.__INITIAL_STATE__) {
  pinia.state.value = window.__INITIAL_STATE__
}

// 等待路由准备就绪后挂载应用
router.isReady().then(() => {
  app.mount('#app')
})

// 类型声明
declare global {
  interface Window {
    __INITIAL_STATE__: any
  }
}
