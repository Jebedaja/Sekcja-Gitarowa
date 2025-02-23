<template>
    <div>
        Hello AlphaTab!
        <button @click="playPause()">Play/Pause</button>
        <div ref="element"></div>
    </div>
  </template>
  
  <script setup lang="ts">
import {ref, onMounted, onUnmounted } from 'vue';
import { AlphaTabApi, Settings } from '@coderline/alphatab'
const element = ref(null);
const api = ref<AlphaTabApi|null>(null)
    onMounted(() => {
  if (!element.value) {
    console.error('Element ref is not attached to DOM.')
    return
  }
  api.value = new AlphaTabApi(element.value, {
    core: {
      file: 'https://www.alphatab.net/files/canon.gp',
      fontDirectory: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.1/dist/font/'
    },
    player: {
      enablePlayer: true,
      enableCursor: true,
      enableUserInteraction: true,
      soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.1/dist/soundfont/sonivox.sf2'
    }
  } as Settings);
})

onUnmounted(()=>{
  api.value?.destroy();
  api.value = null;
})
function playPause() {
  api.value?.playPause();
}
</script>