import { warn, VEBOUNDARY_HOOK_KEY } from '@utils';
import { inject, Ref } from 'vue';

type BoundaryState = {
  error: Ref<Error | null>;
  reset: () => void;
};

export function useBoundary() {
  const info = inject<BoundaryState>(VEBOUNDARY_HOOK_KEY);
  if (!info) warn('Please use useboundary in VeErrorBoundary');
  return info as BoundaryState;
}
