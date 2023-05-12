<script setup lang="ts">
import {useBoundary} from '@src';

const {reset, error} = useBoundary();
</script>

<template>
  <p id="error_info">{{ error?.message ?? '' }}</p>
  <button id="reset_btn" @click="reset">reset</button>
</template>

<script lang="ts">
export default {
  name: 'HookTestComponent',
};
</script>
