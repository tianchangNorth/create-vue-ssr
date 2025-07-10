import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import type { Request, Response } from 'express'
import devalue from '@nuxt/devalue'
import { basename } from 'node:path';

export interface AppContext {
  redirect?: string,
  title?: string,
  keywords?: string,
  description?: string,
  modules?: string[],
  httpStatusCode?: number,
}

export interface RenderContext {
  url: string,
  manifest: Record<string, string[]>,
  request: Request
  response: Response
}

export async function render({ url, manifest, request, response }: RenderContext) {
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
  let title = meta.title as string || 'Vue SSR App'
  let description = meta.description as string || 'Vue SSR Application'
  let keywords = meta.keywords as string || 'Vue SSR Application'

  const ctx: AppContext = {};
  if (ctx.redirect) {
    response.redirect(ctx.redirect);
    return false;
  }
  if (ctx.title) {
    title = ctx.title;
  }
  if (ctx.description) {
    description = ctx.description;
  }
  if (ctx.keywords) {
    keywords = ctx.keywords;
  }

  const preloadLinks = renderPreloadLinks(ctx.modules ?? [], manifest);

  return {
    html,
    preload: preloadLinks,
    state: devalue(pinia.state.value),
    meta: {
      title,
      keywords,
      description
    },
    statusCode: 200
  }
}

function renderPreloadLinks(modules: string[], manifest: Record<string, string[]>) {
  let links = '';
  const seen = new Set<string>();

  modules.forEach((id) => {
    const files = manifest[id];

    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          const filename = basename(file);

          seen.add(file);

          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile);
              seen.add(depFile);
            }
          }

          links += renderPreloadLink(file);
        }
      });
    }
  });

  return links;
}

function renderPreloadLink(file: string) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  }
  else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  }
  else {
    return '';
  }
}
