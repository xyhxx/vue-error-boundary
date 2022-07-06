<script setup lang="ts">
defineProps<{
  error: Error;
  reset: () => void;
}>();
</script>

<template>
  <p id="error">{{ error.name }},{{ error.message }}</p>
  <button id="reset" @click="reset">Reset</button>
</template>

<script lang="ts">
export default {
  name: 'TestErrorCapture',
};
</script>
