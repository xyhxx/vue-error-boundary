import {describe, test, beforeEach, expect} from 'vitest';
import HookTest from './components/hook.vue';
import ClickTest from './components/click.vue';
import {h, defineComponent} from 'vue-demi';
import {mount} from '@vue/test-utils';
import ErrorBoundary from '@src';

let App: any;

beforeEach(function () {
  App = defineComponent({
    setup() {
      return function () {
        return h(
          ErrorBoundary,
          {},
          {
            default: () => h(ClickTest),
            fallback: () => h(HookTest),
          },
        );
      };
    },
  });
});

describe('useBoundary hook', function () {
  test('error info', async function () {
    const app = mount(App);

    const throwBtn = app.get('#throw');
    await throwBtn.trigger('click');

    const error = app.find('#error_info');
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe('throwError');

    const resetBtn = app.get('#reset_btn');
    await resetBtn.trigger('click');

    const throwBtn2 = app.find('#throw');
    expect(throwBtn2.exists()).toBe(true);
  });
});
