<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const { title, count, doubleCount } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <div class="home">
    <h1>{{ title }}</h1>
    <p>计数器: {{ count }}</p>
    <p>双倍计数: {{ doubleCount }}</p>
    <button @click="increment">增加</button>
    <p>这是一个 Vue 3 SSR 应用示例</p>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #369870;
}
</style>
