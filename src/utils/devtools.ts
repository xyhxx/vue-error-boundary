import {
  ComponentInternalInstance,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  Ref,
} from 'vue-demi';
import {
  DevtoolsPluginApi,
  setupDevtoolsPlugin,
  App,
  CustomInspectorNode,
  ComponentState,
} from '@vue/devtools-api';
import {throttle} from './throttle';

type DevtoolsState = {
  error: Ref<Error | null>;
  info: Ref<string>;
};

let API: DevtoolsPluginApi<Record<string, any>> | undefined;

const INSPECTOR_ID = 'VeBoundary ID';
const THROTTLE_DURATION = 50;
const COMPONENT_NAME = 'VeBoundary';
const STATE_TYPE = 'VeBoundary';
const TIMELINE_ID = 'VeBoundary Timeline ID';
const THEME = 0x43c6ac;

const memoState = new Map<string, DevtoolsState>();

function formatTreeState() {
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

  return arr;
}

function formatInspectState() {
  const arr = [];
  for (const [key, val] of memoState.entries()) {
    const obj: ComponentState = {
      type: STATE_TYPE,
      key,
      value: {
        name: val.error.value?.name || '',
        message: val.error.value?.message || '',
        stack: val.error.value?.stack || '',
        info: val.info.value,
      },
    };

    arr.push(obj);
  }

  return arr;
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
          editable: false,
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
      info: [{key: 'info', value: errorInfo.info.value}],
    };
  });
}

function getInspectorTree() {
  API?.on.getInspectorTree(function (payload) {
    if (payload.inspectorId !== INSPECTOR_ID) return;

    payload.rootNodes = formatTreeState();
  });
}

function visitComponentTree() {
  API?.on.visitComponentTree(function (payload) {
    const node = payload.treeNode;
    if (node.name !== COMPONENT_NAME) return;
    const instance = payload.componentInstance as ComponentInternalInstance;
    let id = instance.attrs?.id as string;
    if (!id) {
      id = `${instance.type.name}-${instance.uid}`;
    }

    if (!id) return;
    node.tags = [
      {
        label: id,
        textColor: 0xffffff,
        backgroundColor: THEME,
      },
    ];
  });
}

function inspectComponent() {
  API?.on.inspectComponent(function (payload) {
    payload.instanceData.state.push(...formatInspectState());
  });
}

function registerTimeline() {
  API?.addTimelineLayer({
    id: TIMELINE_ID,
    label: 'VeBoundary',
    color: THEME,
  });
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
      inspectComponent();
      registerTimeline();
    },
  );
}

export function refreshInspector() {
  if (!__DEV__) return;

  const fn = throttle(function () {
    async function refresh() {
      await nextTick();
      API?.sendInspectorState(INSPECTOR_ID);
      API?.sendInspectorTree(INSPECTOR_ID);
      API?.notifyComponentUpdate();
    }

    setTimeout(function () {
      refresh();
    }, THROTTLE_DURATION);
  }, THROTTLE_DURATION);

  fn();
}

export function registerDevtools(arg: DevtoolsState) {
  if (!__DEV__) return;
  const instance = getCurrentInstance();
  if (!instance) return;
  if (!API) {
    const {app} = instance.appContext;
    if (!app) {
      return;
    }

    installDevtoolsPlugin(app);
  }
  let label = instance.attrs?.id as string;
  if (!label) {
    label = `${instance.type.name}-${instance.uid}`;
  }

  onBeforeUnmount(function () {
    refreshInspector();

    memoState.delete(label);
  });

  memoState.set(label, arg);
  refreshInspector();
}

export function addTimeline(id: string | null, groupId?: string) {
  if (!__DEV__ || !id) return;

  const errorInfo = memoState.get(id);
  if (!errorInfo) return;
  const isError = errorInfo.error.value !== null;

  API?.addTimelineEvent({
    layerId: TIMELINE_ID,
    event: {
      groupId,
      time: API.now(),
      data: isError
        ? {
            type: 'captured error',
            name: errorInfo.error.value?.name || '',
            message: errorInfo.error.value?.message || '',
            stack: errorInfo.error.value?.stack || '',
            info: errorInfo.info.value,
          }
        : {
            type: 'reset',
          },
    },
  });
}
