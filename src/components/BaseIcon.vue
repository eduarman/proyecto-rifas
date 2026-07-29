<script setup>
// Renders raw inner SVG markup inside a normalized 24x24 viewBox,
// mirroring the prototype's icon() helper.
defineProps({
  paths: { type: String, required: true },
  size: { type: Number, default: 18 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" v-html="paths" />
</template>
