import ErrorBoundary, {
  ErrorBoundaryProps,
  VueErrorBoundaryEmit,
  VueErrorBoundaryEmitPayload,
} from '@src';
import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const App = defineComponent({
  emits: ['captured'],
  setup(_, { emit }) {
    const emitCaptured: VueErrorBoundaryEmit = function (error) {
      emit('captured', error);
    };

    return function () {
      return h(
        ErrorBoundary,
        { onErrorCaputred: emitCaptured },
        {
          default: () => h(ClickThrow),
          fallback: (e: ErrorBoundaryProps) => h(Caputre, e),
        },
      );
    };
  },
});

describe('ErrorBoundary emit value', async function () {
  test('should emit error', async function () {
    const app = mount(App);

    const throwBtn = app.get('#throw');

    await throwBtn.trigger('click');

    expect(app.emitted().captured).toBeTruthy();

    const payload = (app.emitted().captured[0] as any)[0] as VueErrorBoundaryEmitPayload;
    expect(payload.error).toBeInstanceOf(Error);
    expect(payload.instance).not.toBeNull();
    expect(payload.info).toBeTypeOf('string');

    expect(payload.error.message).toBe('throwError');
    expect(payload.error.name).toBe('Error');
    expect(payload.info).toBe('native event handler');
  });
});
