import { mount } from '@vue/test-utils';

import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import ErrorBoundary, { ErrorBoundaryProps } from '../src';
import { defineComponent, h } from 'vue';

let App: any;

describe('capture error', function () {
  beforeEach(function () {
    App = defineComponent({
      setup() {
        return () =>
          h(
            ErrorBoundary,
            {},
            {
              default: () => h(ClickThrow),
              fallback: (e: ErrorBoundaryProps) => h(Caputre, e),
            },
          );
      },
    });
  });

  test('shoule capture error', async function () {
    const app = mount(App);

    const throwBtn = app.get('#throw');

    await throwBtn.trigger('click');

    expect(app.find('#error').exists()).toBe(true);
  });

  test('capture error message', async function () {
    const app = mount(App);

    const throwBtn = app.get('#throw');

    await throwBtn.trigger('click');

    const error = app.find('#error');

    expect(error.exists()).toBe(true);
    expect(error.text()).toBe('Error,throwError');
  });
});
