<script setup lang="ts">
function throwError() {
  throw new Error('throwError');
}
</script>

<template>
  <button id="throw" @click="throwError">throw error</button>
</template>

<script lang="ts">
export default {
  name: 'ClickTestComponent',
};
</script>
