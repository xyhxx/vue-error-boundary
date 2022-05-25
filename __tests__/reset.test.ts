import ErrorBoundary from '../src';
import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import { mount } from '@vue/test-utils';

const App = {
  components: {
    ClickThrow,
    ErrorBoundary,
    Caputre,
  },
  template: `<ErrorBoundary>
    <ClickThrow />

    <template #fallback="errors">
      <Caputre v-bind="errors" />
    </template>
  </ErrorBoundary>`,
};

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
