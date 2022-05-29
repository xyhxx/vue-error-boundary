import { registerDevtools, warn, refreshInspector } from '@utils';
import { ComponentPublicInstance, defineComponent, onErrorCaptured, ref, VNode } from 'vue';
import { nanoid } from 'nanoid';

const ids = new Set<string>();

function generateId(): string {
  const id = nanoid(5);

  if (ids.has(id)) {
    return generateId();
  }

  return id;
}

export type VueErrorBoundaryProps = {
  propagation?: boolean;
  include?: string[] | RegExp;
  exclude?: string[] | RegExp;
  keepEmit?: boolean;
  label?: string;
};
export type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
};
export type VueErrorBoundaryEmit = (arg: VueErrorBoundaryEmitPayload) => void;
export type VueErrorBoundaryEmitPayload = {
  error: Error;
  instance: ComponentPublicInstance | null;
  info: string;
};

const ErrorBoundaryComponent = defineComponent({
  name: 'VeBoundary',
  inheritAttrs: false,
  props: {
    propagation: { type: Boolean, default: false },
    keepEmit: { type: Boolean, default: false },
    label: {
      type: String,
      default: () => generateId(),
      validator(value: string) {
        return !ids.has(value);
      },
    },
    // eslint-disable-next-line vue/require-default-prop
    include: [Array, RegExp],
    // eslint-disable-next-line vue/require-default-prop
    exclude: [Array, RegExp],
  },
  emits: ['caputred'],
  setup(props, { slots, emit }) {
    ids.add(props.label);

    if (__DEV__ && !slots.default) {
      warn('you did not provide a default slot');
    }
    if (__DEV__ && !slots.fallback) {
      warn('you did not provide a fallback slot');
    }

    const error = ref<Error | null>(null);
    const errorInfo = ref('');

    __DEV__ && registerDevtools({ error, info: errorInfo });

    onErrorCaptured(function (err, instance, info) {
      __DEV__ && refreshInspector();

      const { name, message } = err;
      let includeState = true,
        excludeState = true;

      if (props.include) {
        if (Array.isArray(props.include)) {
          includeState = (props.include as string[]).some(
            item => name === item || message === item,
          );
        } else {
          includeState = props.include.test(message);
        }
      }
      if (props.exclude) {
        if (Array.isArray(props.exclude)) {
          excludeState = (props.exclude as string[]).every(
            item => name !== item && message !== item,
          );
        } else {
          excludeState = !props.exclude.test(message);
        }
      }

      const captured = includeState && excludeState;
      if (captured) {
        error.value = err;
        errorInfo.value = info;
      }
      if (captured || (!captured && props.keepEmit)) {
        emit('caputred', { error: err, instance, info });
      }

      if (!captured) return true;
      return props.propagation;
    });

    function reset() {
      __DEV__ && refreshInspector();

      error.value = null;
      errorInfo.value = '';
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
    $emit: {
      (e: 'caputred', payload: VueErrorBoundaryEmitPayload): void;
    };
  };
};

export default ErrorBoundary;
