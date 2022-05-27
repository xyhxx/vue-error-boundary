<script setup lang="ts">
function throwError() {
  throw new ReferenceError('throwReferenceError');
}
</script>

<template>
  <button @click="throwError" id="ref_error">ref error</button>
</template>

<script lang="ts">
export default {
  name: 'TestRefError',
};
</script>
