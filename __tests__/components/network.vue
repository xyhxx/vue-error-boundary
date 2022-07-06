<script setup lang="ts">
import { useQuery } from 'vue-query';
import axios from 'axios';

const props = defineProps<{ returnError: boolean }>();

const { data, suspense } = useQuery(
  'demo',
  async function () {
    const url = props.returnError ? 'error' : 'list';
    const { data } = await axios.get<
      | {
          status: 'success';
          data: string[];
        }
      | { status: 'error'; data: string }
    >(url);

    if (data.status === 'success') {
      return data.data;
    }
    throw new Error(data.data);
  },
  { retry: false },
);

await suspense();
</script>

<template>
  <ul id="data_list">
    <li v-for="(item, idx) in data" :key="idx">{{ item }}</li>
  </ul>
</template>

<script lang="ts">
export default {
  name: 'SuspenseWrapper',
};
</script>
