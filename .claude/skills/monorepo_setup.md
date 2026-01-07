# Skill: monorepo_setup

## Description
Setup monorepo structure.

## Instructions
This skill sets up and manages monorepo structures for multi-package projects, supporting various tools and frameworks including npm workspaces, pnpm workspaces, Yarn workspaces, Nx, Turborepo, and Python monorepos with Poetry or uv.

## Monorepo Benefits

1. **Code Sharing:** Share code between packages easily
2. **Atomic Changes:** Make cross-package changes in single commits
3. **Consistent Tooling:** Single configuration for linting, testing, building
4. **Simplified Dependencies:** Manage dependencies centrally
5. **Better Refactoring:** Refactor across package boundaries confidently

## Supported Monorepo Tools

### 1. npm Workspaces (Simple)
### 2. pnpm Workspaces (Performance)
### 3. Yarn Workspaces (Classic)
### 4. Nx (Enterprise, Task Orchestration)
### 5. Turborepo (Build Caching, Speed)
### 6. Lerna (Legacy, Still Supported)
### 7. Python (Poetry/uv with workspaces)

## Setup Process

### Step 1: Choose Tool

Ask user:
- **Project type:** Frontend, Backend, Fullstack, Microservices
- **Scale:** Small (2-5 packages), Medium (5-15), Large (15+)
- **Build requirements:** Simple, Complex with caching, Enterprise CI/CD
- **Team size:** Solo, Small team, Large team

**Recommendations:**
- **Simple projects:** npm/pnpm workspaces
- **Performance critical:** pnpm workspaces or Turborepo
- **Complex builds:** Nx or Turborepo
- **Python projects:** Poetry or uv with PEP 660

### Step 2: Initialize Structure

## npm Workspaces Setup

### Directory Structure
```
monorepo/
├── package.json           # Root package.json with workspaces
├── packages/
│   ├── api/              # Backend API package
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── web/              # Frontend web package
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   └── shared/           # Shared utilities
│       ├── package.json
│       ├── src/
│       └── tsconfig.json
├── apps/                  # Optional: Applications
│   └── mobile/
├── .gitignore
├── .npmrc
├── tsconfig.base.json    # Base TypeScript config
└── README.md
```

### Root package.json
```json
{
  "name": "monorepo-root",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "clean": "npm run clean --workspaces --if-present"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Package template (packages/api/package.json)
```json
{
  "name": "@monorepo/api",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@monorepo/shared": "*"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

## Turborepo Setup

### Installation
```bash
npx create-turbo@latest
```

### turbo.json Configuration
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Root package.json (Turborepo)
```json
{
  "name": "monorepo-turborepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.0.0"
  }
}
```

### Turborepo Features
- **Remote Caching:** Share build cache across team
- **Task Pipelines:** Define task dependencies
- **Incremental Builds:** Only rebuild what changed
- **Parallel Execution:** Run tasks in parallel

## Nx Setup

### Installation
```bash
npx create-nx-workspace@latest
```

### nx.json Configuration
```json
{
  "extends": "nx/presets/npm.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "inputs": ["default", "^default"],
      "cache": true
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["!{projectRoot}/**/*.spec.ts"]
  }
}
```

### Project Configuration (packages/api/project.json)
```json
{
  "name": "api",
  "sourceRoot": "packages/api/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{workspaceRoot}/dist/packages/api"],
      "options": {
        "outputPath": "dist/packages/api",
        "main": "packages/api/src/index.ts",
        "tsConfig": "packages/api/tsconfig.json"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "options": {
        "jestConfig": "packages/api/jest.config.ts"
      }
    }
  }
}
```

### Nx Features
- **Dependency Graph:** Visualize project dependencies
- **Affected Commands:** Only test/build affected projects
- **Generators:** Scaffold new packages/features
- **Plugins:** Rich ecosystem for frameworks

## pnpm Workspaces Setup

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### .npmrc
```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

### Root package.json
```json
{
  "name": "monorepo-pnpm",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r --stream build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  }
}
```

### Benefits
- **Disk efficiency:** Shared node_modules with hard links
- **Fast installs:** Parallel downloads
- **Strict:** Better dependency isolation

## Python Monorepo Setup (Poetry)

### Directory Structure
```
monorepo/
├── pyproject.toml        # Root project config
├── poetry.lock
├── packages/
│   ├── api/
│   │   ├── pyproject.toml
│   │   ├── src/
│   │   │   └── api/
│   │   └── tests/
│   ├── shared/
│   │   ├── pyproject.toml
│   │   ├── src/
│   │   │   └── shared/
│   │   └── tests/
│   └── cli/
│       ├── pyproject.toml
│       ├── src/
│       │   └── cli/
│       └── tests/
├── .python-version
└── README.md
```

### Root pyproject.toml
```toml
[tool.poetry]
name = "monorepo"
version = "0.1.0"
description = "Python monorepo"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0.0"
mypy = "^1.0.0"
black = "^23.0.0"
ruff = "^0.1.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Package pyproject.toml (packages/api/pyproject.toml)
```toml
[tool.poetry]
name = "api"
version = "0.1.0"
description = "API package"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
shared = { path = "../shared", develop = true }

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## Python Monorepo Setup (uv)

### pyproject.toml (uv workspace)
```toml
[project]
name = "monorepo"
version = "0.1.0"
requires-python = ">=3.11"

[tool.uv.workspace]
members = ["packages/*"]

[tool.uv.sources]
api = { workspace = true }
shared = { workspace = true }
cli = { workspace = true }

[dependency-groups]
dev = [
    "pytest>=7.0.0",
    "mypy>=1.0.0",
    "ruff>=0.1.0"
]
```

### Package pyproject.toml (packages/api/pyproject.toml)
```toml
[project]
name = "api"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "shared"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

## Common Configurations

### TypeScript Base Config (tsconfig.base.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### Package tsconfig.json (Extends Base)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### ESLint Config (.eslintrc.json)
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

### Prettier Config (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### .gitignore
```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
.turbo/

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
.venv/
```

## Workflow Scripts

### Cross-package Development
```json
{
  "scripts": {
    "dev:all": "turbo run dev --parallel",
    "dev:api": "turbo run dev --filter=@monorepo/api...",
    "build:affected": "nx affected:build",
    "test:affected": "nx affected:test",
    "graph": "nx graph"
  }
}
```

### Version Management (Changesets)
```bash
# Install
npm install -D @changesets/cli
npx changeset init

# Add changeset
npx changeset

# Version packages
npx changeset version

# Publish
npx changeset publish
```

### Changesets Config (.changeset/config.json)
```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

## Best Practices

### 1. Package Naming
- Use scoped packages: `@monorepo/package-name`
- Consistent naming: `@company/api`, `@company/web`

### 2. Dependencies
- Shared dev dependencies in root
- Package-specific dependencies in packages
- Use `workspace:*` for internal dependencies (pnpm)

### 3. Scripts
- Consistent script names across packages
- Use `--parallel` for dev, `--stream` for build
- Filter packages for faster development

### 4. TypeScript
- Use project references for faster builds
- Share base config, extend in packages
- Enable `composite: true` for incremental builds

### 5. Testing
- Run tests in parallel
- Use `--affected` to test only changed code
- Share test configuration

### 6. CI/CD
- Cache dependencies between runs
- Use affected commands to skip unchanged packages
- Parallel jobs for independent packages

### 7. Documentation
- Root README with monorepo overview
- Package READMEs with specific docs
- Document cross-package dependencies

## CI/CD Example (GitHub Actions)

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: npx nx affected:test --base=origin/main

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
```

## Usage

### Initialize New Monorepo
```
monorepo_setup init --tool turborepo --name my-monorepo
```

### Add New Package
```
monorepo_setup add-package --name api --type backend
monorepo_setup add-package --name web --type frontend
monorepo_setup add-package --name shared --type library
```

### Migrate Existing Project
```
monorepo_setup migrate --from single-repo --to monorepo --tool nx
```

### Generate Configuration
```
monorepo_setup config --tool turborepo --typescript --eslint --prettier
```

## Output

The skill will:
1. Create complete monorepo structure
2. Configure build tools (Turbo/Nx/Workspaces)
3. Setup TypeScript project references
4. Configure linting and formatting
5. Add common scripts and workflows
6. Generate documentation
7. Setup CI/CD templates

## Troubleshooting

### Common Issues

**Dependency Resolution:**
- Clear caches: `pnpm store prune`, `rm -rf node_modules`
- Check workspace protocol: `workspace:*`

**TypeScript Errors:**
- Build packages in correct order
- Check project references
- Enable `composite: true`

**Build Performance:**
- Enable caching (Turbo/Nx)
- Use affected commands
- Parallel execution

## Notes

- Start simple, add complexity as needed
- Choose tool based on project requirements
- Consider team familiarity with tools
- Document workflows clearly
- Use versioning tools (Changesets) for npm packages
- Regular dependency updates across packages
