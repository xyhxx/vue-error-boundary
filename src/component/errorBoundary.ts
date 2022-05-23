import { ComponentPublicInstance, defineComponent, onErrorCaptured, ref, VNode } from 'vue';

export type VueErrorBoundaryProps = {
  propagation?: boolean;
  include?: string[] | RegExp;
  exclude?: string[] | RegExp;
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
  props: {
    propagation: { type: Boolean, default: false },
    include: [Array, RegExp],
    exclude: [Array, RegExp],
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
        if (Array.isArray(include)) {
          includeState = (include as string[]).some(item => name === item || message === item);
        } else {
          includeState = include.test(message);
        }
      }

      if (exclude) {
        if (Array.isArray(exclude)) {
          excludeState = (exclude as string[]).every(item => name !== item && message !== item);
        } else {
          excludeState = !exclude.test(message);
        }
      }

      const captured = includeState && excludeState;

      if (captured) {
        error.value = err;
      }

      if (captured || (!captured && keepEmit)) {
        emit('errorCaputred', { error: err, instance, info });
      }

      if (!captured) return true;

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
