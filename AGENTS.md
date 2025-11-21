# AGENTS.md

## Commands

- **Build**: `yarn build` - TypeScript compilation + esbuild bundling
- **Test**: `yarn test` - Run all Jest tests
- **Single test**: `yarn test -- path/to/test.test.ts` - Run specific test file
- **Lint**: `yarn lint` - TSLint checking
- **Format**: `yarn format` - Prettier formatting

## Code Style Guidelines

- **Imports**: Use ES6 imports, group external libs first, then internal modules
- **Formatting**: Prettier config - 120 print width, trailing commas, single quotes
- **Types**: Strict TypeScript, interfaces for complex objects, explicit return types
- **Naming**: PascalCase for classes, camelCase for methods/variables, UPPER_SNAKE_CASE for constants
- **Error handling**: Try-catch blocks with meaningful error messages, re-throw when appropriate
- **Tests**: Jest with ts-jest, describe/it/test structure, mock external dependencies
- **File structure**: Classes in `src/classes/`, types in `src/types/`, SOAP definitions in `src/soap/`
- **Comments**: Portuguese comments for business logic, English for technical documentation
