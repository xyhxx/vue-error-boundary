<script setup lang="ts">
function throwError() {
  throw new ReferenceError('throwReferenceError');
}
</script>

<template>
  <button id="ref_error" @click="throwError">ref error</button>
</template>

<script lang="ts">
export default {
  name: 'TestRefError',
};
</script>
