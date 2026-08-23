import '@testing-library/jest-dom'

// jsdom ships neither ResizeObserver nor the pointer-capture APIs that Radix
// primitives (Select, Dialog) call on mount. Minimal stubs keep component
// tests from crashing; nothing in the tests depends on real measurements.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
}

if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
}
