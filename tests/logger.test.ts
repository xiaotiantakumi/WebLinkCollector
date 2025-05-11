/**
 * Tests for the logging module
 */

import { createLogger } from '../src/logger';

describe('createLogger', () => {
  // Save the original console methods to restore later
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
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
    
    expect(console.debug).toHaveBeenCalledWith('[DEBUG] Debug message');
    expect(console.info).toHaveBeenCalledWith('[INFO] Info message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
  });
  
  it('logs messages for info level and above when level is info', () => {
    const logger = createLogger('info');
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith('[INFO] Info message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
  });
  
  it('logs messages for warn level and above when level is warn', () => {
    const logger = createLogger('warn');
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
  });
  
  it('logs only error messages when level is error', () => {
    const logger = createLogger('error');
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('[ERROR] Error message');
  });
  
  it('logs no messages when level is none', () => {
    const logger = createLogger('none');
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
  
  it('includes additional arguments in log messages', () => {
    const logger = createLogger('debug');
    const additionalData = { key: 'value' };
    
    logger.debug('Debug message', additionalData);
    
    expect(console.debug).toHaveBeenCalledWith('[DEBUG] Debug message', additionalData);
  });
});