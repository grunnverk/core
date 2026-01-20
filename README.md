# @eldrforge/core

Core utilities for kodrdriv command packages.

## Installation

```bash
npm install @eldrforge/core
```

## Usage

```typescript
import { Config, getLogger, create as createDiff } from '@eldrforge/core';

// Use core utilities in your command package
const logger = getLogger();
const diff = await createDiff({
    excludedPatterns: ['node_modules'],
    maxDiffBytes: 20480
});
const diffContent = await diff.get();
```

## Features

### Content Utilities
- **diff.ts** - Git diff operations with intelligent truncation
- **log.ts** - Git log operations
- **files.ts** - File content collection for context

### Utility Functions
- **general.ts** - Version management, file paths, timestamping
- **interactive.ts** - TTY prompts and user interaction
- **aiAdapter.ts** - Convert kodrdriv config to AI service format
- **storageAdapter.ts** - Storage adapter for AI service
- **loggerAdapter.ts** - Logger adapter for AI service
- **stopContext.ts** - Sensitive content filtering
- **gitMutex.ts** - Repository-level git locking
- **fileLock.ts** - File-based cross-process locking
- **validation.ts** - Data validation utilities
- **errorHandler.ts** - Standardized error handling

### Foundation
- **types.ts** - TypeScript type definitions and Zod schemas
- **constants.ts** - Package constants and defaults
- **logging.ts** - Winston logger configuration

## Documentation

For AI agents and developers:
- [Agentic Guide](./guide/index.md) - Start here for AI-assisted development
- [API Documentation](./guide/usage.md) - Detailed API reference
- [Architecture](./guide/architecture.md) - Package design and structure

## License

Apache-2.0


<!-- Build: 2026-01-15 15:59:12 UTC -->
