<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { title } = storeToRefs(store)
const { setTitle } = store
const newTitle = ref('')

const updateTitle = () => {
  if (newTitle.value.trim()) {
    setTitle(newTitle.value)
    newTitle.value = ''
  }
}
</script>

<template>
  <div class="about">
    <h1>关于我们</h1>
    <p>这是关于页面，展示了 Vue 3 SSR 的路由功能。</p>
    <p>当前应用标题: {{ title }}</p>
    <input v-model="newTitle" placeholder="输入新标题" />
    <button @click="updateTitle">更新标题</button>
  </div>
</template>

<style scoped>
.about {
  padding: 20px;
}

input {
  margin: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #369870;
}
</style>
