import ErrorBoundary, { ErrorBoundaryProps } from '../src';
import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const App = defineComponent({
  setup() {
    return function () {
      return h(
        ErrorBoundary,
        {},
        {
          default: () => h(ClickThrow),
          fallback: (e: ErrorBoundaryProps) => h(Caputre, e),
        },
      );
    };
  },
});

describe('errorboundary retry', function () {
  test('retry shoule rerender default slot', async function () {
    const app = mount(App);

    const throwBtn = app.get('#throw');

    await throwBtn.trigger('click');

    expect(app.find('#error').exists()).toBe(true);

    const retryBtn = app.get('#reset');

    await retryBtn.trigger('click');

    expect(app.find('#error').exists()).toBe(false);
    expect(app.find('#throw').exists()).toBe(true);
  });
});
