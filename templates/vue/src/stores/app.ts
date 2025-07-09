import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const title = ref('Vue SSR App')
  const count = ref(0)

  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function setTitle(newTitle: string) {
    title.value = newTitle
  }

  return {
    title,
    count,
    doubleCount,
    increment,
    setTitle
  }
})
