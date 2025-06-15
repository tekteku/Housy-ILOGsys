# Contributing to Housy Tunisia

We love your input! We want to make contributing to Housy Tunisia as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, track issues and feature requests, as well as accept pull requests.

### 1. Fork the Repository

Fork the repo and create your branch from `main`.

```bash
git clone https://github.com/yourusername/housy-tunisia.git
cd housy-tunisia
git checkout -b feature/my-new-feature
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### 3. Make Your Changes

- Write clean, readable code
- Follow our coding standards
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run unit tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run formatting
npm run format
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Create a pull request against the `main` branch
- Provide a clear description of your changes

## 📋 Coding Standards

### TypeScript

We use TypeScript with strict mode enabled. All new code should:

- Use proper type annotations
- Avoid `any` types when possible
- Follow existing patterns for type definitions
- Use interfaces for object shapes
- Use enums for constants

```typescript
// Good
interface User {
  id: number;
  email: string;
  role: 'admin' | 'client';
}

// Avoid
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Follow the component structure pattern
- Use TypeScript interfaces for props
- Implement proper error boundaries

```tsx
// Component structure
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // Component logic here
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### File Organization

```
src/
├── components/
│   ├── feature-name/
│   │   ├── FeatureComponent.tsx
│   │   ├── FeatureComponent.test.tsx
│   │   └── index.ts
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── pages/
│   ├── FeaturePage.tsx
│   └── index.ts
├── hooks/
│   ├── useFeature.ts
│   └── index.ts
├── types/
│   ├── feature.ts
│   └── index.ts
└── utils/
    ├── helpers.ts
    └── constants.ts
```

### API Routes

- Use proper HTTP methods
- Implement authentication where needed
- Add input validation with Zod
- Follow REST conventions
- Include proper error handling

```typescript
// Example API route structure
router.post('/api/resource', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const validatedData = resourceSchema.parse(req.body);
    
    // Process request
    const result = await service.createResource(validatedData);
    
    // Return response
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource'
    });
  }
});
```

## 🎨 UI/UX Guidelines

### Design System

- Use TailwindCSS utility classes
- Follow the existing color palette
- Maintain consistent spacing
- Ensure mobile responsiveness

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

### Animation Guidelines

- Use Framer Motion for animations
- Keep animations subtle and purposeful
- Respect `prefers-reduced-motion`
- Maintain 60fps performance

```tsx
// Good animation example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Content
</motion.div>
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for utility functions
- Test component behavior
- Mock external dependencies
- Aim for 80%+ coverage

```typescript
// Example test
describe('calculateEstimation', () => {
  it('should calculate correct total cost', () => {
    const materials = [
      { quantity: 10, unitPrice: 100 },
      { quantity: 5, unitPrice: 200 }
    ];
    
    const result = calculateEstimation(materials);
    expect(result.totalCost).toBe(2000);
  });
});
```

### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication flows
- Mock external services

### E2E Tests

- Test critical user journeys
- Test cross-browser compatibility
- Test responsive design
- Test accessibility features

## 🚨 Security Guidelines

### Authentication & Authorization

- Never store passwords in plain text
- Use JWT tokens properly
- Implement proper session management
- Follow principle of least privilege

### Input Validation

- Validate all user inputs
- Use Zod schemas for validation
- Sanitize data before database operations
- Implement rate limiting

### AI Model Security

- Restrict Ollama access to admins only
- Log all AI model usage
- Validate AI responses
- Implement proper error handling

```typescript
// Example validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'client'])
});
```

## 📚 Documentation

### Code Documentation

- Use JSDoc for functions
- Include examples in complex code
- Document component props
- Explain business logic

```typescript
/**
 * Calculates construction cost estimation
 * @param materials - Array of materials with quantities and prices
 * @param options - Estimation options (wastage, quality level)
 * @returns Detailed cost breakdown
 */
export function calculateEstimation(
  materials: Material[],
  options: EstimationOptions
): EstimationResult {
  // Implementation
}
```

### API Documentation

- Document all endpoints
- Include request/response examples
- Specify authentication requirements
- Document error responses

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/housy-tunisia/issues).

### Great Bug Reports Include:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional Context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We also use GitHub issues to track feature requests. When requesting a feature:

- Explain the problem you're trying to solve
- Describe the solution you'd like
- Consider alternative solutions
- Provide context about your use case

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `security` - Security-related issues
- `ai` - AI/ML related features
- `ui/ux` - User interface improvements

## ⚡ Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Code refactoring
- `test/test-improvement` - Test updates

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(ai): add ollama integration for admin users
fix(auth): resolve token validation issue
docs(readme): update installation instructions
refactor(components): improve component structure
test(api): add integration tests for estimation
```

### Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with your changes
3. The PR will be merged once you have the sign-off of maintainers

### Pull Request Template

```markdown
## Changes Made
- [ ] Feature/fix description
- [ ] Tests added/updated
- [ ] Documentation updated

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
<!-- Add screenshots for UI changes -->

## Notes
<!-- Any additional notes for reviewers -->
```

## 🎯 Areas for Contribution

### High Priority
- AI model optimization
- Security enhancements
- Performance improvements
- Mobile responsiveness
- Accessibility features

### Medium Priority
- New estimation features
- UI/UX improvements
- Documentation updates
- Test coverage
- Internationalization

### Good First Issues
- Bug fixes
- Component cleanup
- Documentation improvements
- Test additions
- Code formatting

## 🆘 Getting Help

- **Documentation**: Check our [docs](docs/)
- **Discord**: Join our [community](https://discord.gg/housy-tunisia)
- **Issues**: Search existing [issues](https://github.com/yourusername/housy-tunisia/issues)
- **Email**: Contact us at support@housy-tunisia.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to Housy Tunisia! 🏗️✨
