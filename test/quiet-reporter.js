import { VerboseReporter } from 'vitest/node';

// Keep Vitest's diagnostics and totals, but omit successful test results.
export default class QuietReporter extends VerboseReporter {
  constructor() {
    super({ summary: false, silent: 'passed-only' });
  }

  shouldLog(log, taskState) {
    // Show warnings/errors immediately, without repeating them on failure.
    if (log.type === 'stderr') return taskState !== 'failed';
    return super.shouldLog(log, taskState);
  }

  onTestCaseResult(test) {
    if (test.result().state !== 'passed' || test.annotations().length) {
      super.onTestCaseResult(test);
    }
  }
}
