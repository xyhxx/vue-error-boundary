import { ComponentInternalInstance, getCurrentInstance, nextTick, onBeforeUnmount, Ref } from 'vue';
import {
  DevtoolsPluginApi,
  setupDevtoolsPlugin,
  App,
  CustomInspectorNode,
} from '@vue/devtools-api';
import { throttle } from './throttle';

type DevtoolsState = {
  error: Ref<Error | null>;
  info: Ref<string>;
};

let API: DevtoolsPluginApi<Record<string, any>> | undefined;

const INSPECTOR_ID = 'VeBoundary';
const THROTTLE_DURATION = 50;
const STATE_TYPE = 'VeBoundary state';

const memoState = new Map<string, DevtoolsState>();

function formatTree() {
  const arr = [];
  for (const [key, val] of memoState.entries()) {
    const isError = val.error.value !== null;
    const obj: CustomInspectorNode = {
      id: key,
      label: key,
      tags: [
        {
          label: isError ? 'error' : 'normal',
          textColor: 0xffffff,
          backgroundColor: isError ? 0xf00056 : 0x21a675,
        },
      ],
    };

    arr.push(obj);
  }

  return [
    {
      id: STATE_TYPE,
      label: 'VeBoundary root',
      children: arr,
    },
  ];
}

function initPluginInfo() {
  API?.addInspector({
    id: INSPECTOR_ID,
    label: 'VeBoundary',
    icon: 'eco',
  });
}

function getInspectorState() {
  API?.on.getInspectorState(function (payload) {
    if (payload.inspectorId !== INSPECTOR_ID) return;
    const id = payload.nodeId;

    const errorInfo = memoState.get(id);

    if (!errorInfo) return;

    payload.state = {
      error: [
        {
          key: 'name',
          value: errorInfo.error.value?.name || '',
        },
        {
          key: 'message',
          value: errorInfo.error.value?.message || '',
        },
        {
          key: 'stack',
          value: errorInfo.error.value?.stack || '',
        },
      ],
      info: [{ key: 'info', value: errorInfo.info.value }],
    };
  });
}

function getInspectorTree() {
  API?.on.getInspectorTree(function (payload) {
    if (payload.inspectorId !== INSPECTOR_ID) return;

    payload.rootNodes = formatTree();
  });
}

function visitComponentTree() {
  API?.on.visitComponentTree(function (payload) {
    const node = payload.treeNode;
    if (node.name !== INSPECTOR_ID) return;
    const instance = payload.componentInstance as ComponentInternalInstance;
    const id = instance.props.label as string;

    if (!id) return;
    node.tags = [
      {
        label: id,
        textColor: 0xffffff,
        backgroundColor: 0x43c6ac,
      },
    ];
  });
}

export function refreshInspector() {
  const fn = throttle(function () {
    async function refresh() {
      await nextTick();
      API?.sendInspectorState(INSPECTOR_ID);
      API?.sendInspectorTree(INSPECTOR_ID);
    }

    setTimeout(function () {
      refresh();
    }, THROTTLE_DURATION);
  }, THROTTLE_DURATION);

  fn();
}

function installDevtoolsPlugin(app: App) {
  if (API) return;
  setupDevtoolsPlugin(
    {
      id: INSPECTOR_ID,
      label: 'VeBoundary',
      packageName: 'veboundary',
      homepage: 'https://github.com/xyhxx/vue-error-boundary',
      app,
      logo: 'https://raw.githubusercontent.com/xyhxx/vue-error-boundary/main/public/logo.svg',
      componentStateTypes: [STATE_TYPE],
    },
    function (api) {
      if (API) return;
      API = api;

      initPluginInfo();
      visitComponentTree();
      getInspectorState();
      getInspectorTree();
    },
  );
}

export function registerDevtools(arg: DevtoolsState) {
  const instance = getCurrentInstance();
  if (!instance) return;
  if (!API) {
    const app = instance.appContext.app;
    if (!app) {
      return;
    }

    installDevtoolsPlugin(app);
  }
  const label = instance.props.label as string;

  onBeforeUnmount(function () {
    refreshInspector();

    memoState.delete(label);
  });

  memoState.set(label, arg);
  refreshInspector();
}
