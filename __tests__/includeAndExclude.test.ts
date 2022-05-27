import ErrorBoundary, { ErrorBoundaryProps, VueErrorBoundaryEmit } from '@src';
import ClickThrow from './components/click.vue';
import Caputre from './components/capture.vue';
import ClickTypeError from './components/typeError.vue';
import ClickRefError from './components/refError.vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

let App: any;

describe('include, exclude, keepEmit', function () {
  beforeEach(function () {
    App = defineComponent({
      props: {
        include: [Array, RegExp],
        exclude: [Array, RegExp],
        keepEmit: Boolean,
      },
      emits: ['captured'],
      setup(props, { emit }) {
        const emitCaptured: VueErrorBoundaryEmit = function (error) {
          emit('captured', error);
        };

        return function () {
          return h(
            ErrorBoundary,
            {
              include: props.include as string[] | RegExp | undefined,
              exclude: props.exclude as string[] | RegExp | undefined,
              keepEmit: props.keepEmit,
              onErrorCaputred: emitCaptured,
            },
            {
              default() {
                return [h(ClickThrow), h(ClickTypeError), h(ClickRefError)];
              },
              fallback(e: ErrorBoundaryProps) {
                return h(Caputre, e);
              },
            },
          );
        };
      },
    });
  });

  test('string array include', async function () {
    const app = mount(App, {
      props: {
        include: ['throwTypeError', 'Error'],
      },
    });

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    let reset = app.find('#reset');
    expect(reset.exists()).toBe(true);

    await reset.trigger('click');

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(true);

    await reset.trigger('click');

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);
  });

  test('regexp include', async function () {
    const regexp = /^(throwReferenceError|throwError)$/;

    const app = mount(App, {
      props: {
        include: regexp,
      },
    });

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    let reset = app.find('#reset');
    expect(reset.exists()).toBe(true);
    await reset.trigger('click');

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(true);
    await reset.trigger('click');

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);
  });

  test('string array exclude', async function () {
    const app = mount(App, {
      props: {
        exclude: ['throwTypeError', 'Error'],
      },
    });

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    let reset = app.find('#reset');
    expect(reset.exists()).toBe(true);

    await reset.trigger('click');

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);
  });

  test('regexp exclude', async function () {
    const regexp = /^(throwReferenceError|throwError)$/;

    const app = mount(App, {
      props: {
        exclude: regexp,
      },
    });

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    let reset = app.find('#reset');
    expect(reset.exists()).toBe(true);

    await reset.trigger('click');

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);
  });

  test('Include and exclude are both true', async function () {
    const regexp = /^(throwReferenceError|throwError)$/;

    const app = mount(App, {
      props: {
        include: ['throwTypeError', 'Error'],
        exclude: regexp,
      },
    });

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    let reset = app.find('#reset');
    expect(reset.exists()).toBe(false);

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(false);

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    reset = app.find('#reset');
    expect(reset.exists()).toBe(true);
  });

  test('keepEmit is true, keep emit on ruled out', async function () {
    const regexp = /^(throwReferenceError|throwError)$/;

    const app = mount(App, {
      props: {
        exclude: regexp,
        keepEmit: true,
      },
    });

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(1);

    let reset = app.find('#reset');
    await reset.trigger('click');

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(2);

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(3);
  });

  test('keepEmit is false', async function () {
    const regexp = /^(throwReferenceError|throwError)$/;

    const app = mount(App, {
      props: {
        exclude: regexp,
        keepEmit: false,
      },
    });

    const typeErrorBtn = app.get('#type_error');
    await typeErrorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(1);

    let reset = app.find('#reset');
    await reset.trigger('click');

    const errorBtn = app.get('#throw');
    await errorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(1);

    const refErrorBtn = app.get('#ref_error');
    await refErrorBtn.trigger('click');

    expect(app.emitted().captured.length).toBe(1);
  });
});
