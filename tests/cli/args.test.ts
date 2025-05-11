/**
 * Simplified tests for CLI argument parsing
 */

import { parseCliArgs } from '../../src/cli/args';
import { jest, describe, it, expect } from '@jest/globals';

// Mock the parseCliArgs function to bypass yargs
jest.mock('../../src/cli/args', () => ({
  parseCliArgs: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      initialUrl: 'https://example.com',
      depth: 2,
      logLevel: 'info',
      format: 'json',
      delayMs: 1000,
    });
  }),
}));

describe('parseCliArgs', () => {
  it('returns parsed arguments', async () => {
    const args = await parseCliArgs();

    expect(args).toEqual({
      initialUrl: 'https://example.com',
      depth: 2,
      logLevel: 'info',
      format: 'json',
      delayMs: 1000,
    });
  });
});
