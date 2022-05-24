import ErrorBoundary from '../src/index';

describe('VueErrorBoundary is define', function () {
  test('VueErrorBoundary is define', function () {
    expect(ErrorBoundary).toBeDefined();
  });

  test('VueErrorBoundary is Component', function () {
    expect(ErrorBoundary).toBeInstanceOf(Object);
  });
});
