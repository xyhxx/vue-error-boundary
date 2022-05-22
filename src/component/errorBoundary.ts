import { ComponentPublicInstance, defineComponent, onErrorCaptured, ref, VNode } from 'vue';

export type VueErrorBoundaryProps = {
  propagation?: boolean;
  include?: string[];
  exclude?: string[];
  includeType?: string[];
  excludeType?: string[];
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
    includeType: Array,
    excludeType: Array,
    keepEmit: { type: Boolean, default: false },
  },
  emits: ['errorCaputred'],
  setup({ propagation, include, exclude, includeType, excludeType, keepEmit }, { slots, emit }) {
    const error = ref<Error | null>(null);

    onErrorCaptured(function (err, instance, info) {
      const { name, message } = err;

      const includeState = /*   */ 0x0001,
        excludeState = /*       */ 0x0010,
        includeTypeState = /*   */ 0x0100,
        excludeTypeState = /*   */ 0x1000,
        capturedState = /*      */ 0x1111;

      let sign = 0x0000;

      if (!include && !exclude && !includeType && !excludeType) {
        sign = capturedState;
      } else {
        switch (true) {
          case !!include:
            include!.includes(message) && (sign |= includeState);

          case !!exclude:
            !exclude!.includes(message) && (sign |= excludeState);

          case !!includeType:
            includeType!.includes(name) && (sign |= includeTypeState);

          case !!excludeType:
            !excludeType!.includes(name) && (sign |= excludeTypeState);
        }
      }

      const captured = sign === capturedState;

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
