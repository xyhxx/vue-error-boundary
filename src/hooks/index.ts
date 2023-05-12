import {warn, VEBOUNDARY_HOOK_KEY} from '@utils';
import {inject, Ref} from 'vue-demi';

type BoundaryState = {
  error: Ref<Error | null>;
  reset: () => void;
};

export function useBoundary(): BoundaryState {
  const info = inject<BoundaryState>(VEBOUNDARY_HOOK_KEY);
  if (!info) warn('Please use useBoundary in ErrorBoundary');
  return info!;
}
