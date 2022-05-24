<script setup lang="ts">
function throwError() {
  throw new Error('throwError');
}
</script>

<template>
  <button @click="throwError" id="throw">throw error</button>
</template>
