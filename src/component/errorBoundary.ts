import { ComponentPublicInstance, defineComponent, onErrorCaptured, ref, VNode } from 'vue';

export type VueErrorBoundaryProps = {
  propagation?: boolean;
  include?: string[];
  exclude?: string[];
  keepEmit?: boolean;
};

export type ErrorBoundaryProps = {
  error: Error;
  instance: ComponentPublicInstance | null;
  info: string;
  reset: () => void;
};

export type VueErrorBoundaryEmit = {
  (e: 'errorCaputred', payload: Omit<ErrorBoundaryProps, 'reset'>): void;
};

const ErrorBoundaryComponent = defineComponent({
  name: 'VueErrorBoundary',
  inheritAttrs: false,
  props: {
    propagation: { type: Boolean, default: false },
    include: Array,
    exclude: Array,
    keepEmit: { type: Boolean, default: false },
  },
  emits: ['errorCaputred'],
  setup({ propagation, include, exclude, keepEmit }, { slots, emit }) {
    const error = ref<Error | null>(null);
    onErrorCaptured(function (err, instance, info) {
      const { name, message } = err;

      let includeState = true,
        excludeState = true;

      if (include) {
        includeState = (include as string[]).some(item => name === item || message === item);
      }

      if (exclude) {
        excludeState = (exclude as string[]).every(item => name !== item && message !== item);
      }

      const captured = includeState && excludeState;

      if (captured) {
        error.value = err;
      }

      if (captured || (!captured && keepEmit)) {
        emit('errorCaputred', { error: err, instance, info });
      }

      return propagation;
    });

    function reset() {
      error.value = null;
    }

    return function () {
      return error.value === null
        ? slots.default?.()
        : slots.fallback?.({ error: error.value, reset });
    };
  },
});

const ErrorBoundary = ErrorBoundaryComponent as unknown as {
  new (): {
    $props: VueErrorBoundaryProps;

    $slots: {
      default: () => VNode[];
      fallback: (arg: ErrorBoundaryProps) => VNode[];
    };

    $emit: VueErrorBoundaryEmit;
  };
};

export default ErrorBoundary;
