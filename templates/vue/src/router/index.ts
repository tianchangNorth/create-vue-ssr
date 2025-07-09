import { createRouter as _createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export function createRouter() {
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: '首页',
        description: '这是首页描述'
      }
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/About.vue'),
      meta: {
        title: '关于我们',
        description: '这是关于页面描述'
      }
    }
  ];

  const router = _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  router.beforeEach(() => {
  });

  return router;
}
