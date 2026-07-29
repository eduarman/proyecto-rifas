<script setup>
// The Rifly mark: a rounded blue square with two diagonal dots.
defineProps({
  size: { type: Number, default: 30 },
  label: { type: Number, default: 17 },
})
</script>

<template>
  <div class="brand">
    <div class="mark" :style="{ width: size + 'px', height: size + 'px' }">
      <span class="dot dot-a" />
      <span class="dot dot-b" />
    </div>
    <span class="name" :style="{ fontSize: label + 'px' }">Rifly</span>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
}
.mark {
  border-radius: 8px;
  background: var(--brand);
  position: relative;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
}
.dot-a {
  top: 20%;
  left: 20%;
}
.dot-b {
  bottom: 20%;
  right: 20%;
}
.name {
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>
