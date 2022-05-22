import { ComponentPublicInstance, defineComponent, onErrorCaptured, ref, VNode } from 'vue';

const ErrorBoundaryComponent = defineComponent({
  name: 'VueErrorBoundary',
  inheritAttrs: false,
  props: {
    propagation: { type: Boolean, default: false },
  },
  emits: ['errorCaputred'],
  setup({ propagation }, { slots, emit }) {
    const error = ref<Error | null>(null);
    const hasError = ref(false);

    onErrorCaptured(function (err, instance, info) {
      error.value = err;
      hasError.value = true;

      emit('errorCaputred', { error: err, instance, info });

      return propagation;
    });

    function reset() {
      hasError.value = false;
      error.value = null;
    }

    return function () {
      return !hasError.value ? slots.default?.() : slots.fallback?.({ error: error.value, reset });
    };
  },
});

export const ErrorBoundary = ErrorBoundaryComponent as unknown as {
  new (): {
    $props: {
      propagation?: boolean;
    };

    $slots: {
      default: () => VNode[];
      fallback: (arg: {
        error: Error;
        instance: ComponentPublicInstance | null;
        info: string;
        reset: () => void;
      }) => VNode[];
    };

    $emit: {
      (
        e: 'errorCaputred',
        payload: {
          error: Error;
          instance: ComponentPublicInstance | null;
          info: string;
        },
      ): void;
    };
  };
};
