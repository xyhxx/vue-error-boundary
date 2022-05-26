import ErrorBoundary, { ErrorBoundaryProps } from '../src';
import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h, onErrorCaptured } from 'vue';

const fn = vi.fn();

let App: any;

describe('onErrorCaptured propagation', function () {
  beforeEach(function () {
    fn.mockReset();
    App = defineComponent({
      props: {
        propagation: Boolean,
        cb: Function,
      },
      components: {
        ClickThrow,
        ErrorBoundary,
        Caputre,
      },
      setup(props) {
        onErrorCaptured(function (errors) {
          fn();
          props.cb?.(errors);
        });

        return function () {
          return h(
            ErrorBoundary,
            { propagation: props.propagation },
            {
              default: () => h(ClickThrow),
              fallback: (e: ErrorBoundaryProps) => h(Caputre, e),
            },
          );
        };
      },
    });
  });

  test('prop propagation is false, onErrorCaptured not capture', async function () {
    const app = mount(App, {
      propsData: {
        propagation: false,
      },
    });

    const throwBtn = app.get('#throw');

    await throwBtn.trigger('click');

    expect(fn).not.toHaveBeenCalled();
  });

  test('prop propagation is true, onErrorCaptured capture', async function () {
    let error: Error | null = null;

    const app = mount(App, {
      propsData: {
        propagation: true,
        cb: (errors: Error) => (error = errors),
      },
    });

    expect(error).toBeNull();

    const throwBtn = app.get('#throw');
    await throwBtn.trigger('click');

    expect(fn).toHaveBeenCalledOnce();
    expect(error).not.toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toBe('throwError');
    expect(error!.name).toBe('Error');

    const resetBtn = app.get('#reset');
    await resetBtn.trigger('click');
    const throwBtn2 = app.get('#throw');
    await throwBtn2.trigger('click');

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
