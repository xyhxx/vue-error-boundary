import ErrorBoundary from '../src';

describe('VueErrorBoundary is define', function () {
  test('VueErrorBoundary is define', function () {
    expect(ErrorBoundary).toBeDefined();
  });

  test('VueErrorBoundary is Component', function () {
    expect(ErrorBoundary).toBeInstanceOf(Object);
  });
});
