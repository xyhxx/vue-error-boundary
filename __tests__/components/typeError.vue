<script setup lang="ts">
function throwError() {
  throw new TypeError('throwTypeError');
}
</script>

<template>
  <button id="type_error" @click="throwError">type error</button>
</template>

<script lang="ts">
export default {
  name: 'TestTypeError',
};
</script>
