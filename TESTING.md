# Testing Guide

## Unit Tests

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Test Structure
- Backend tests in `backend/tests/`
- Frontend tests in `frontend/__tests__/`

## Integration Tests

```bash
npm run test:integration
```

## E2E Tests

```bash
npm run test:e2e
```

## Testing Best Practices

- Write tests for all new features
- Maintain test coverage above 80%
- Use meaningful test descriptions
- Mock external API calls
- Test error scenarios
- Use fixtures for test data

## Debugging Tests

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```
