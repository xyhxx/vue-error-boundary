import ErrorBoundary, { ErrorBoundaryProps } from '@src';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref, Suspense } from 'vue';
import Caputre from './components/capture.vue';
import NetworkCom from './components/network.vue';
import { QueryClient } from 'vue-query';
import { vi, describe, test, expect } from 'vitest';

const client = new QueryClient();

vi.mock('axios');

const App = defineComponent({
  setup() {
    const returnError = ref(true);
    function errorEmit() {
      returnError.value = !returnError.value;
    }

    return function () {
      return h(
        ErrorBoundary,
        {
          onCaputred: errorEmit,
        },
        {
          default() {
            return h(Suspense, null, {
              default() {
                return h(NetworkCom, {
                  returnError: returnError.value,
                });
              },
              fallback() {
                return h('p', { id: 'loading' }, 'loading...');
              },
            });
          },
          fallback(e: ErrorBoundaryProps) {
            return h(Caputre, e);
          },
        },
      );
    };
  },
});

describe('suspense', function () {
  test('network and suspense', async function () {
    const app = mount(App, {
      global: {
        provide: { VUE_QUERY_CLIENT: client },
      },
    });

    const loading = app.find('#loading');
    expect(loading.exists()).toBe(true);

    await flushPromises();

    const error = app.find('#error');
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe('Error,network error');

    const reset = app.get('#reset');
    await reset.trigger('click');
    await flushPromises();

    const list = app.find('#data_list');
    expect(list.exists()).toBe(true);

    const child = list.findAll('li');
    expect(child).toHaveLength(3);

    expect(list).toMatchSnapshot();
  });
});
