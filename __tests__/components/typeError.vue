<script setup lang="ts">
function throwError() {
  throw new TypeError('throwTypeError');
}
</script>

<template>
  <button @click="throwError" id="type_error">type error</button>
</template>

<script lang="ts">
export default {
  name: 'TestTypeError',
};
</script>
