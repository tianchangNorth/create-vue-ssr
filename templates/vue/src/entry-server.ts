import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import type { Request, Response } from 'express'
import devalue from '@nuxt/devalue'

export interface RenderContext {
  url: string
  request: Request
  response: Response
}

export async function render({ url, request, response }: RenderContext) {
  const { app, router, pinia } = createApp()

  // 设置服务端路由
  await router.push(url)
  await router.isReady()

  // 检查路由是否存在
  const matchedRoute = router.currentRoute.value.matched[0]
  if (!matchedRoute) {
    return {
      html: '',
      state: '{}',
      meta: {
        title: '404 - 页面未找到',
        description: '请求的页面不存在'
      },
      statusCode: 404
    }
  }

  // 渲染应用
  const html = await renderToString(app)

  // 获取路由元信息
  const meta = router.currentRoute.value.meta
  const title = meta.title as string || 'Vue SSR App'
  const description = meta.description as string || 'Vue SSR Application'

  return {
    html,
    state: devalue(pinia.state.value),
    meta: {
      title,
      description
    },
    statusCode: 200
  }
}
