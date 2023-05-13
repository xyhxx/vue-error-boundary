<script setup lang="ts">
import axios from 'axios';
import { reactive } from 'vue';

const list = reactive<string[]>([]);

const props = defineProps<{ returnError: boolean }>();
const url = props.returnError ? 'error' : 'list';
const { data } = await axios.get<
  | {
      status: 'success';
      data: string[];
    }
  | { status: 'error'; data: string }
>(url);

if (data.status === 'success') list.push(...data.data);
else throw new Error(data.data);
</script>

<template>
  <ul id="data_list">
    <li v-for="(item, idx) in list" :key="idx">{{ item }}</li>
  </ul>
</template>

<script lang="ts">
export default {
  name: 'SuspenseWrapper',
};
</script>
