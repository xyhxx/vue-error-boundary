import { mount } from '@vue/test-utils';

import ClickThrow from './components/click.vue';
import ErrorBoundary from '../src/index';
import Caputre from './components/capture.vue';

let App: any;

describe('capture error', function () {
  beforeEach(function () {
    App = {
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
