# Benchmark System Refactoring

This document summarizes the refactoring changes made to simplify the benchmark system.

## What Changed

### Directory Structure
- Consolidated multiple files into a few core files
- Eliminated unnecessary server dependencies
- Replaced Express with native Node.js http

### Core Files
- `src/benchmarks/core.ts`: Combined functionality from:
  - benchmarkRunner.ts
  - runner.ts
  - server/index.ts
- `src/benchmarks/cli.ts`: Simplified CLI that uses core
- `src/benchmarks/index.ts`: Updated to use new structure

### Removed Dependencies
- Express
- CORS

### Simplified API
- Replaced full Express server with lightweight Node.js http server
- Condensed the API endpoints into a single handler function
- Maintained the same functionality with less code

## Benefits

1. **Reduced Complexity**: Fewer files to manage and understand
2. **Smaller Dependency Footprint**: Removed unnecessary dependencies
3. **Better Organization**: Logically grouped related functionality
4. **Easier Maintenance**: Core functionality in a single file for better cohesion
5. **Same Features**: All original functionality preserved

## Migration

If you were using the previous structure directly, here's how to update:

```diff
- import { runNodeTest } from "./runner";
- import { runAllChallenges } from "./benchmarkRunner";
+ import { runTest, runBenchmark } from "./core";

- const server = startServer(); // From server/index.ts
+ const server = createGraderServer(); // From core.ts
```

## Testing

The refactored code should be tested by:

1. Running benchmarks on sample challenges
2. Launching the grader UI
3. Verifying all API endpoints function correctly
4. Testing visualization screenshot capture 