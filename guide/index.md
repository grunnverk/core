# @grunnverk/core - Agentic Guide

## Purpose

Core utilities for kodrdriv command packages. Provides shared infrastructure including:
- Content generation (diff, log, files)
- Utility functions (general, interactive, adapters)
- Foundation (types, constants, logging)

## Quick Reference

For AI agents working with this package:
- [Architecture](./architecture.md) - Package structure and design
- [Usage](./usage.md) - How to use core utilities
- [Development](./development.md) - Contributing guidelines
- [Configuration](./configuration.md) - Setup and configuration

## Key Exports

```typescript
// Content utilities
import { create as createDiff } from '@grunnverk/core';
import { create as createLog } from '@grunnverk/core';
import { create as createFiles } from '@grunnverk/core';

// Utilities
import { getOutputPath, improveContentWithLLM } from '@grunnverk/core';

// Foundation
import { Config, getLogger } from '@grunnverk/core';
```

## Dependencies

- @grunnverk/git-tools
- @grunnverk/github-tools
- @grunnverk/ai-service
- @grunnverk/shared

## Package Structure

```
src/
├── content/          # Git content utilities
│   ├── diff.ts      # Git diff operations
│   ├── log.ts       # Git log operations
│   └── files.ts     # File content collection
├── util/            # Utility functions
│   ├── general.ts   # General utilities
│   ├── interactive.ts # Interactive prompts
│   ├── aiAdapter.ts # AI service adapter
│   ├── storageAdapter.ts # Storage adapter
│   ├── loggerAdapter.ts # Logger adapter
│   ├── stopContext.ts # Content filtering
│   ├── gitMutex.ts  # Git repository locking
│   ├── fileLock.ts  # File-based locking
│   ├── validation.ts # Data validation
│   └── errorHandler.ts # Error handling
├── types.ts         # TypeScript types
├── constants.ts     # Package constants
├── logging.ts       # Winston logging setup
└── index.ts         # Main exports
```

