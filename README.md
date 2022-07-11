<p align="center">
  <img src="./public/logo.svg" width="200" alt="logo" />
</p>

<br />
<br />

<h1 align="center">VeBoundary</h1>

<p align="center">Simple and convenient Vue error boundary.</p>

The idea comes from[react-error-boundary](https://github.com/bvaughn/react-error-boundary), catch
errors thrown by subcomponents and provide a UI for fallback slot when the error is displayed.

# Features

- 🔗 easy, out of the box.
- 🔧 support devtools.
- 🔑 type safe.
- 🔨 unit testing.

# Catalogue

- [Installation](#install)
- [Usage](#usage)
  - [Slot Scope](#slot-scope)
  - [Emit](#emit)
  - [Props](#props)
    - [propagation](#propagation)
    - [include & exclude](#include-exclude)
    - [keepEmit](#keepemit)
  - [Suspense](#suspense)
  - [useBoundary](#useboundary)
- [Devtools](#Devtools)
- [LICENSE](#license)

# Install

Install plugins into dependencies, you can use which you like package manager.

```
pnpm add veboundary

```

# Usage

```vue
<script lang="ts" setup>
import VueErrorBoundary from 'veboundary';
import Son from './son.vue';
import FallbackComponent from './fallback.vue';
</script>

<template>
  <VueErrorBoundary>
    <Son />

    <template #fallback>
      <FallbackComponent />
    </template>
  </VueErrorBoundary>
</template>
```

## Slot Scope

if you want to get error information, you can get it through slot scope. the slot scope provides two
variables, one of `error:Error`. one of `reset:() = > void`;

`reset` rerenders the default slot, and you can provide a button in the fallback component to try to
rerender

```vue
<script lang="ts" setup>
import ErrorBoundary from 'veboundary';
import Son from './son.vue';
import FallbackComponent from './fallback.vue';
</script>

<template>
  <ErrorBoundary>
    <Son />

    <template #fallback="{ error, reset }">
      <FallbackComponent :error="error" :reset="reset" />
    </template>
  </ErrorBoundary>
</template>
```

## Emit

If you want a more detailed error report, you can get it from emit.

```vue
<script lang="ts" setup>
import VueErrorBoundary,{VueErrorBoundaryEmit} from 'veboundary';
import Son from './son.vue';
import FallbackComponent, from './fallback.vue';

const caputedEmit: VueErrorBoundaryEmit = function ({ error, instance, info }) {
  console.log(error.message);
};
</script>

<template>
  <VueErrorBoundary @caputred="caputedEmit">
    <Son />

    <template #fallback="errors">
      <FallbackComponent v-bind="errors" />
    </template>
  </VueErrorBoundary>
</template>
```

## Props

### propagation

`Veboundary` captures errors through `onErrorCaptured`. If you also use `onErrorCaptured` in the
parent component, errors will not be captured. If you want to capture errors in the parent
component, you can pass in the `propagation` prop.

**TIPS: If exclude is true, the `onErrorCaptured` of the parent component must catch errors, even if
`false` is passed in from the `propagation`.About exclude, we will mention it later.**

```vue
<script lang="ts" setup>
import VueErrorBoundary from 'veboundary';
import Son from './son.vue';
import FallbackComponent, from './fallback.vue';
</script>

<template>
  <VueErrorBoundary propagation>
    <Son />

    <template #fallback="errors">
      <FallbackComponent v-bind="errors" />
    </template>
  </VueErrorBoundary>
</template>
```

### include-exclude

If you only want to catch some errors, you can pass in `include:string[] | RegExp` or
`exclude:string[] | RegExp` props.

**TIPS: If include or exclude is of type string[], will match error.message and error.name, if
include or exclude is of type RegExp, only match error.message**

```vue
<script lang="ts" setup>
import VueErrorBoundary from 'veboundary';
import Son from './son.vue';
import FallbackComponent, from './fallback.vue';

 const regexp = /^(throwReferenceError|throwError)$/;
 const list = ['network some error', 'TypeError']
</script>

<template>
  <VueErrorBoundary :include="list" :exclude="regexp">
    <Son />

    <template #fallback="errors">
      <FallbackComponent v-bind="errors" />
    </template>
  </VueErrorBoundary>
</template>
```

### keepEmit

If exclude is true, `errorCaptured` emit will not be triggered. If you want to trigger emit when
exclude is true, you can pass in `keepEmit`.

```vue
<script lang="ts" setup>
import VueErrorBoundary,{VueErrorBoundaryEmit} from 'veboundary';
import Son from './son.vue';
import FallbackComponent, from './fallback.vue';

 const regexp = /^(throwReferenceError|throwError)$/;
 const list = ['network some error', 'TypeError']

 const caputedEmit: VueErrorBoundaryEmit = function ({ error, instance, info }) {
  console.log(error.message);
};
</script>

<template>
  <VueErrorBoundary :include="list" :exclude="regexp" @caputred="caputedEmit" keep-emit>
    <Son />

    <template #fallback="errors">
      <FallbackComponent v-bind="errors" />
    </template>
  </VueErrorBoundary>
</template>
```

## Suspense

You can view the examples used with suspense+vue-query in the
[codesandbox](https://codesandbox.io/s/pcmg9e)

## useBoundary

It is not necessary to obtain reset and error through props,more convenient to use hook.

```ts

const {error, reset} = useBoundary();
console.log(error?.message, error?.name);
...

```

# Devtools

Support Vue devtools.You can view the error information and other contents in the developer tool.

You can add an `id` to the component for marking. If no `id` is passed in, VeBoundary will
automatically generate an id as a mark.Be careful not to duplicate `id`, data with the same `id`
will be overwritten.

# LICENSE

MIT
