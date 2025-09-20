# Contributing to DevStack

Thank you for considering contributing to DevStack! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/devstack.git`
3. Run the setup script: `./setup.sh`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Setup
```bash
# Run the setup script (recommended)
./setup.sh

# Or manual setup
npm install
npm run build
npm run test:run
```

### Development
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Style

- Use ESLint configuration provided
- Follow existing code patterns
- Write tests for new features
- Keep components small and focused
- Use TypeScript when possible

## Testing

- Write unit tests for utilities and components
- Use React Testing Library for component tests
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Submitting Changes

1. Ensure all tests pass: `npm run test:run`
2. Ensure linting passes: `npm run lint`
3. Build successfully: `npm run build`
4. Commit with clear message
5. Push to your fork
6. Create a Pull Request

## Pull Request Guidelines

- Clear description of changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure CI passes
- Be responsive to feedback

## Adding New Tools

When adding a new developer tool:

1. Create component in `src/components/`
2. Add tests in same directory
3. Add to navigation in `Dashboard.jsx`
4. Update README.md
5. Ensure responsive design
6. Test thoroughly

## Privacy & Security

- All processing must happen client-side
- No data should be sent to external servers
- Use secure crypto libraries
- Test security implications

## Questions?

Feel free to open an issue for questions or clarifications.
