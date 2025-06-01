/**
 * Tests for the logging module
 */

import { createLogger } from '../src/logger';
import { describe, it, beforeEach, afterEach, expect, mock } from 'bun:test';

describe('createLogger', () => {
  // Save the original console methods to restore later
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  // Create mocks for console methods
  const mockDebug = mock(() => {});
  const mockInfo = mock(() => {});
  const mockWarn = mock(() => {});
  const mockError = mock(() => {});

  beforeEach(() => {
    // Mock console methods
    console.debug = mockDebug as any;
    console.info = mockInfo as any;
    console.warn = mockWarn as any;
    console.error = mockError as any;

    // Clear mocks
    mockDebug.mockClear();
    mockInfo.mockClear();
    mockWarn.mockClear();
    mockError.mockClear();
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it('logs all messages when level is debug', () => {
    const logger = createLogger('debug');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(mockDebug).toHaveBeenCalledWith('[DEBUG] Debug message');
    expect(mockInfo).toHaveBeenCalledWith('[INFO] Info message');
    expect(mockWarn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(mockError).toHaveBeenCalledWith('[ERROR] Error message');
  });

  it('logs messages for info level and above when level is info', () => {
    const logger = createLogger('info');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(mockDebug).not.toHaveBeenCalled();
    expect(mockInfo).toHaveBeenCalledWith('[INFO] Info message');
    expect(mockWarn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(mockError).toHaveBeenCalledWith('[ERROR] Error message');
  });

  it('logs messages for warn level and above when level is warn', () => {
    const logger = createLogger('warn');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(mockDebug).not.toHaveBeenCalled();
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockWarn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(mockError).toHaveBeenCalledWith('[ERROR] Error message');
  });

  it('logs only error messages when level is error', () => {
    const logger = createLogger('error');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(mockDebug).not.toHaveBeenCalled();
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledWith('[ERROR] Error message');
  });

  it('logs no messages when level is none', () => {
    const logger = createLogger('none');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(mockDebug).not.toHaveBeenCalled();
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  it('includes additional arguments in log messages', () => {
    const logger = createLogger('debug');
    const additionalData = { key: 'value' };

    logger.debug('Debug message', additionalData);

    expect(mockDebug).toHaveBeenCalledWith('[DEBUG] Debug message', additionalData);
  });
});
