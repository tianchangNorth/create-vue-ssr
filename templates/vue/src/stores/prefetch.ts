import { ref } from 'vue';
import { defineStore } from 'pinia';

export const usePrefetchStore = defineStore('prefetch', () => {
  const data = ref<Record<string, any>>({});

  // 只在开发环境检查重复 Key
  if (import.meta.env.DEV) {
    const duplicateKeys = ref<string[]>([]);
    const definedKeys = ref<Record<string, boolean>>({});

    return { data, duplicateKeys, definedKeys };
  }

  return { data };
});
