import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const execAsync = promisify(exec);
const TEST_TIMEOUT = 10000;

describe('CLI', () => {
  const testDir = path.join(process.cwd(), 'test-cli');
  const testFile = path.join(testDir, 'test.js');
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  
  beforeEach(async () => {
    // Create test directory and file
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'console.log("test");');
    
    // Ensure API key is set for most tests
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  afterEach(async () => {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
    // Restore original API key
    process.env.OPENROUTER_API_KEY = originalApiKey;
  });

  it('should show error when API key is missing', async () => {
    // Create clean env without the API key
    const env = { ...process.env };
    delete env.OPENROUTER_API_KEY;
    
    const { stdout, stderr } = await execAsync('node ./dist/cli.js -p "test prompt"', {
      env // Pass the modified environment to the child process
    }).catch(error => ({
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    }));
    
    console.log('Test output:', { stdout, stderr });
    expect(stderr).toContain('OPENROUTER_API_KEY environment variable is required');
  }, TEST_TIMEOUT);

  it.skip('should require prompt parameter', async () => {
    const { stderr } = await execAsync('node ./dist/cli.js').catch(error => error);
    expect(stderr).toContain('required option');
    expect(stderr).toContain('--prompt');
  }, TEST_TIMEOUT);

  it.skip('should accept custom directory', async () => {
    const { stdout } = await execAsync(
      `node ./dist/cli.js -p "test prompt" -d ${testDir} --dry-run`
    ).catch(error => ({
      stdout: error.stdout || '',
      stderr: error.stderr
    }));
    expect(stdout).toContain(`Processing directory: ${testDir}`);
  }, TEST_TIMEOUT);

  it.skip('should accept custom model', async () => {
    const { stdout } = await execAsync(
      `node ./dist/cli.js -p "test prompt" --model openai/gpt-4 --dry-run`
    ).catch(error => ({
      stdout: error.stdout || '',
      stderr: error.stderr
    }));
    expect(stdout).toContain('Model: openai/gpt-4');
  }, TEST_TIMEOUT);

  it.skip('should handle dry run mode', async () => {
    const { stdout } = await execAsync(
      `node ./dist/cli.js -p "test prompt" --dry-run`
    ).catch(error => ({
      stdout: error.stdout || '',
      stderr: error.stderr
    }));
    expect(stdout).not.toContain('Writing changes');
    expect(stdout).toContain('Processing directory:');
  }, TEST_TIMEOUT);

  it.skip('should show error for non-existent directory', async () => {
    const { stderr } = await execAsync(
      'node ./dist/cli.js -p "test prompt" -d ./nonexistent-dir'
    ).catch(error => error);
    expect(stderr).toContain('Error:');
  }, TEST_TIMEOUT);
});
