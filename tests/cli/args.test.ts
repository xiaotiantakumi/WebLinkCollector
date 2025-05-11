/**
 * Tests for CLI argument parsing
 */

import { parseCliArgs } from '../../src/cli/args';

// Mock yargs parser to avoid affecting process.argv during tests
jest.mock('yargs', () => {
  const mockYargs = {
    scriptName: jest.fn().mockReturnThis(),
    usage: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    options: jest.fn().mockReturnThis(),
    example: jest.fn().mockReturnThis(),
    epilogue: jest.fn().mockReturnThis(),
    help: jest.fn().mockReturnThis(),
    alias: jest.fn().mockReturnThis(),
    parse: jest.fn(),
  };
  
  return () => mockYargs;
});

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn(arr => arr),
}));

describe('parseCliArgs', () => {
  let mockYargs: any;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Get reference to the mocked yargs instance
    mockYargs = require('yargs')();
  });
  
  it('configures all expected CLI options', async () => {
    // Setup mock return value for parse
    mockYargs.parse.mockResolvedValue({
      initialUrl: 'https://example.com',
      depth: 2
    });
    
    // Call the function
    await parseCliArgs();
    
    // Verify all expected options are configured
    expect(mockYargs.option).toHaveBeenCalledWith('initialUrl', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('depth', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('filters', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('filtersFile', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('selector', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('delayMs', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('logLevel', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('output', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('format', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('configFile', expect.any(Object));
  });
  
  it('verifies initialUrl is required', async () => {
    await parseCliArgs();
    
    // Get the initialUrl option configuration
    const initialUrlOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'initialUrl'
    )[1];
    
    expect(initialUrlOption.demandOption).toBe(true);
  });
  
  it('verifies depth is validated to be between 0 and 5', async () => {
    await parseCliArgs();
    
    // Get the depth option configuration
    const depthOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'depth'
    )[1];
    
    expect(depthOption.choices).toEqual([0, 1, 2, 3, 4, 5]);
  });
  
  it('provides default values where specified', async () => {
    await parseCliArgs();
    
    // Get options with default values
    const depthOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'depth'
    )[1];

    const delayMsOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'delayMs'
    )[1];

    const logLevelOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'logLevel'
    )[1];

    const formatOption = mockYargs.option.mock.calls.find(
      (call: any) => call[0] === 'format'
    )[1];
    
    expect(depthOption.default).toBe(1);
    expect(delayMsOption.default).toBe(1000);
    expect(logLevelOption.default).toBe('info');
    expect(formatOption.default).toBe('json');
  });
  
  it('configures help option', async () => {
    await parseCliArgs();
    
    expect(mockYargs.help).toHaveBeenCalled();
    expect(mockYargs.alias).toHaveBeenCalledWith('help', 'h');
  });
});