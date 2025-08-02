# Frontend Testing Setup Guide

## 🚀 **Quick Start**

### **1. Install Testing Dependencies**
```bash
npm install --save-dev jest @vue/test-utils @testing-library/vue msw
npm install --save-dev cypress @cypress/vue
```

### **2. Add Test Scripts to package.json**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

### **3. Create Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
```

### **4. Create Test Setup File**
```javascript
// tests/setup.js
import { config } from '@vue/test-utils'

// Global test configuration
config.global.mocks = {
  $router: {
    push: jest.fn(),
    replace: jest.fn()
  },
  $route: {
    params: {},
    query: {}
  }
}
```

## 🧪 **Example Tests**

### **Component Test Example**
```javascript
// tests/unit/components/OnboardingForm.test.js
import { mount } from '@vue/test-utils'
import OnboardingForm from '@/components/OnboardingForm.vue'

describe('OnboardingForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(OnboardingForm, {
      props: {
        step: 0,
        formData: {
          gender: '',
          birthdate: '',
          height: '',
          weight: ''
        }
      }
    })
  })

  test('renders gender dropdown', () => {
    expect(wrapper.find('#gender').exists()).toBe(true)
  })

  test('emits form update when gender changes', async () => {
    await wrapper.find('#gender').setValue('male')
    expect(wrapper.emitted('update:form')[0][0].gender).toBe('male')
  })

  test('validates required fields', async () => {
    await wrapper.vm.$nextTick()
    const form = wrapper.find('form')
    await form.trigger('submit')
    
    // Should show validation errors
    expect(wrapper.text()).toContain('Gender is required')
  })
})
```

### **Store Test Example**
```javascript
// tests/unit/store/auth.test.js
import { createStore } from 'vuex'
import auth from '@/store/modules/auth'

describe('Auth Store', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        auth
      }
    })
  })

  test('sets token on login', () => {
    const token = 'fake-token'
    store.commit('auth/setToken', token)
    expect(store.state.auth.token).toBe(token)
  })

  test('clears token on logout', () => {
    store.commit('auth/setToken', 'fake-token')
    store.commit('auth/logout')
    expect(store.state.auth.token).toBe(null)
  })
})
```

### **API Test Example**
```javascript
// tests/unit/api/auth.test.js
import { login, signup } from '@/api/auth'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      token: 'fake-token',
      user: { userName: 'testuser', email: 'test@example.com' }
    }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Auth API', () => {
  test('login returns token and user data', async () => {
    const response = await login('testuser', 'password')
    expect(response.token).toBe('fake-token')
    expect(response.user.userName).toBe('testuser')
  })
})
```

## 🔧 **Cypress E2E Setup**

### **Cypress Configuration**
```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true
  }
})
```

### **E2E Test Example**
```javascript
// cypress/e2e/auth.cy.js
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should login successfully', () => {
    cy.get('[data-testid=username]').type('testuser')
    cy.get('[data-testid=password]').type('password123')
    cy.get('[data-testid=login-button]').click()
    
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid=user-menu]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid=username]').type('invalid')
    cy.get('[data-testid=password]').type('wrong')
    cy.get('[data-testid=login-button]').click()
    
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid credentials')
  })
})
```

## 📊 **Coverage Configuration**

### **Jest Coverage Setup**
```javascript
// jest.config.js (additional coverage config)
module.exports = {
  // ... existing config
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
```

## 🚀 **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests in CI
npm run test:e2e:ci
```

## 📝 **Best Practices**

1. **Use data-testid attributes** for reliable element selection
2. **Mock external dependencies** (API calls, router, etc.)
3. **Test user interactions** not implementation details
4. **Keep tests focused** - one assertion per test
5. **Use descriptive test names** that explain the behavior
6. **Clean up after tests** to avoid state pollution

## 🔍 **Debugging Tests**

```bash
# Debug Jest tests
npm test -- --verbose --no-coverage

# Debug Cypress tests
npm run test:e2e -- --headed --no-exit
```

This setup provides a solid foundation for testing your Vue.js frontend with both unit/integration tests and E2E tests. 