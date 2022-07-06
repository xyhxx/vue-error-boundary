import { registerDevtools, warn, refreshInspector, addTimeline, VEBOUNDARY_HOOK_KEY } from '@utils';
import {
  ComponentPublicInstance,
  defineComponent,
  getCurrentInstance,
  onErrorCaptured,
  provide,
  ref,
  VNode,
} from 'vue';

export type VueErrorBoundaryProps = {
  propagation?: boolean;
  include?: string[] | RegExp;
  exclude?: string[] | RegExp;
  keepEmit?: boolean;
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

// record the ID used
const ids = new Set();

const ErrorBoundaryComponent = defineComponent({
  name: 'VeBoundary',
  inheritAttrs: false,
  props: {
    propagation: { type: Boolean, default: false },
    keepEmit: { type: Boolean, default: false },
    // eslint-disable-next-line vue/require-default-prop
    include: [Array, RegExp],
    // eslint-disable-next-line vue/require-default-prop
    exclude: [Array, RegExp],
  },
  emits: ['caputred'],
  setup(props, { slots, emit, attrs }) {
    let label: string | null = null;
    if (__DEV__) {
      const id = attrs?.id as string;

      if (id) {
        label = id;
        if (ids.has(id)) {
          warn(`duplicate id: ${id}`);
          return;
        }

        ids.add(id);
      } else {
        const instance = getCurrentInstance();
        instance && (label = `${instance.type.name}-${instance.uid}`);
      }
    }

    if (!slots.default) {
      warn('you did not provide a default slot');
    }
    if (!slots.fallback) {
      warn('you did not provide a fallback slot');
    }

    const error = ref<Error | null>(null);
    const errorInfo = ref('');
    function reset() {
      error.value = null;
      errorInfo.value = '';

      refreshInspector();
      addTimeline(label);
    }

    // provide state for useBoundary
    provide(VEBOUNDARY_HOOK_KEY, {
      reset,
      error,
    });

    registerDevtools({ error, info: errorInfo });

    onErrorCaptured(function (err, instance, info) {
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

      refreshInspector();
      addTimeline(label);

      if (!captured) return true;
      return props.propagation;
    });

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
