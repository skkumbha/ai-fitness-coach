# Testing Strategy for FitCoach AI

## 🎯 **Testing Philosophy**

Our testing strategy follows the **Testing Pyramid** approach:
- **Unit Tests** (70%): Fast, reliable, test individual components
- **Integration Tests** (20%): Test component interactions
- **End-to-End Tests** (10%): Test complete user workflows

## 🏗️ **Testing Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Test Repository                      │
│  (Separate repo: fitcoach-ai-tests)                        │
│  - Selenium/Playwright tests                               │
│  - API contract tests                                      │
│  - Performance tests                                       │
│  - Cross-browser tests                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐
│  Frontend Repo  │    │  Backend Repo   │
│  (fitcoach-ai-  │    │  (personal-     │
│   frontend)     │    │   assistant-    │
│                 │    │   fitness-      │
│ Unit Tests:     │    │   coach)        │
│ - Vue components│    │                 │
│ - Vuex store    │    │ Unit Tests:     │
│ - API calls     │    │ - Controllers   │
│                 │    │ - Services      │
│ Integration:    │    │ - Repositories  │
│ - Component     │    │                 │
│   integration   │    │ Integration:    │
│ - API mocking   │    │ - API endpoints│
│                 │    │ - Database      │
└─────────────────┘    └─────────────────┘
```

## 📁 **Repository Structure**

### **1. Frontend Repository Tests**
```
fitcoach-ai-frontend/
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── OnboardingForm.test.js
│   │   │   ├── LoginPage.test.js
│   │   │   └── DashboardPage.test.js
│   │   ├── store/
│   │   │   ├── auth.test.js
│   │   │   └── user.test.js
│   │   └── api/
│   │       ├── auth.test.js
│   │       └── profile.test.js
│   ├── integration/
│   │   ├── auth-flow.test.js
│   │   ├── onboarding-flow.test.js
│   │   └── dashboard-flow.test.js
│   └── e2e/
│       ├── auth.spec.js
│       └── onboarding.spec.js
├── jest.config.js
├── cypress.config.js
└── package.json
```

### **2. Backend Repository Tests**
```
personal-assistant-fitness-coach/
├── src/
│   ├── test/
│   │   ├── java/
│   │   │   ├── unit/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── repositories/
│   │   │   └── integration/
│   │   │       ├── AuthControllerIT.java
│   │   │       ├── UserControllerIT.java
│   │   │       └── WorkoutControllerIT.java
│   │   └── resources/
│   │       └── application-test.properties
├── pom.xml
└── Dockerfile.test
```

### **3. E2E Test Repository**
```
fitcoach-ai-tests/
├── e2e/
│   ├── specs/
│   │   ├── auth/
│   │   │   ├── login.spec.js
│   │   │   ├── signup.spec.js
│   │   │   └── logout.spec.js
│   │   ├── onboarding/
│   │   │   ├── basic-info.spec.js
│   │   │   ├── fitness-goals.spec.js
│   │   │   └── preferences.spec.js
│   │   ├── dashboard/
│   │   │   ├── workout-history.spec.js
│   │   │   ├── chat.spec.js
│   │   │   └── profile.spec.js
│   │   └── api/
│   │       ├── auth-contract.spec.js
│   │       ├── user-contract.spec.js
│   │       └── workout-contract.spec.js
│   ├── fixtures/
│   │   ├── users.json
│   │   └── workouts.json
│   ├── support/
│   │   ├── commands.js
│   │   └── utils.js
│   └── pages/
│       ├── LoginPage.js
│       ├── OnboardingPage.js
│       └── DashboardPage.js
├── performance/
│   ├── load-tests/
│   │   └── api-load-test.js
│   └── stress-tests/
│       └── concurrent-users.js
├── contract-tests/
│   ├── auth-contract.json
│   ├── user-contract.json
│   └── workout-contract.json
├── cypress.config.js
├── playwright.config.js
├── jest.config.js
└── package.json
```

## 🧪 **Test Types & Tools**

### **Frontend Tests**
```javascript
// Unit Tests (Jest + Vue Test Utils)
import { mount } from '@vue/test-utils'
import OnboardingForm from '@/components/OnboardingForm.vue'

describe('OnboardingForm', () => {
  test('updates form data when gender is selected', async () => {
    const wrapper = mount(OnboardingForm, {
      props: { step: 0, formData: {} }
    })
    
    await wrapper.find('#gender').setValue('male')
    expect(wrapper.emitted('update:form')[0][0].gender).toBe('male')
  })
})

// Integration Tests (Jest + MSW)
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'fake-token', user: mockUser }))
  })
)

// E2E Tests (Cypress)
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login')
    cy.get('[data-testid=username]').type('testuser')
    cy.get('[data-testid=password]').type('password123')
    cy.get('[data-testid=login-button]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

### **Backend Tests**
```java
// Unit Tests (JUnit 5 + Mockito)
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void shouldAuthenticateValidUser() {
        // Given
        LoginRequest request = new LoginRequest("user", "pass");
        User user = new User("user", "hashedPass");
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        
        // When
        AuthResponse response = authService.login(request);
        
        // Then
        assertThat(response.getToken()).isNotNull();
        assertThat(response.getUser().getUsername()).isEqualTo("user");
    }
}

// Integration Tests (Spring Boot Test)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
class AuthControllerIT {
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldLoginUser() {
        LoginRequest request = new LoginRequest("user", "pass");
        
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/login", request, AuthResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getToken()).isNotNull();
    }
}
```

### **E2E Tests**
```javascript
// Playwright E2E Tests
import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete onboarding and access dashboard', async ({ page }) => {
    // 1. Sign up
    await page.goto('http://fit.kish.rs/signup')
    await page.fill('[data-testid=firstName]', 'John')
    await page.fill('[data-testid=lastName]', 'Doe')
    await page.fill('[data-testid=userName]', 'johndoe')
    await page.fill('[data-testid=email]', 'john@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=signup-button]')
    
    // 2. Complete onboarding
    await page.waitForURL('**/onboarding')
    await page.selectOption('[data-testid=gender]', 'male')
    await page.fill('[data-testid=birthdate]', '1990-01-01')
    await page.fill('[data-testid=height]', '175')
    await page.fill('[data-testid=weight]', '70')
    await page.click('[data-testid=next-button]')
    
    // 3. Verify dashboard access
    await page.waitForURL('**/dashboard')
    await expect(page.locator('[data-testid=dashboard-title]')).toBeVisible()
  })
})

// API Contract Tests
import { test, expect } from '@playwright/test'

test.describe('API Contracts', () => {
  test('auth endpoints should match contract', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { userName: 'test', password: 'test' }
    })
    
    expect(response.status()).toBe(200)
    const body = await response.json()
    
    // Verify contract
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('user')
    expect(body.user).toHaveProperty('userName')
    expect(body.user).toHaveProperty('email')
  })
})
```

## 🚀 **CI/CD Integration**

### **Frontend CI Pipeline**
```yaml
# .github/workflows/frontend-tests.yml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e:ci
```

### **Backend CI Pipeline**
```yaml
# .github/workflows/backend-tests.yml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: mvn test
      - run: mvn test:integration
```

### **E2E Test Pipeline**
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: 
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e:staging
      - run: npm run test:performance
```

## 📊 **Test Coverage Goals**

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: All critical user journeys
- **Performance Tests**: Response time < 2s for 95% of requests

## 🔧 **Recommended Tools**

### **Frontend Testing**
- **Unit/Integration**: Jest + Vue Test Utils + MSW
- **E2E**: Cypress or Playwright
- **Visual Regression**: Percy or Chromatic

### **Backend Testing**
- **Unit**: JUnit 5 + Mockito
- **Integration**: Spring Boot Test + TestContainers
- **API Testing**: REST Assured

### **E2E Testing**
- **Browser Automation**: Playwright (recommended) or Cypress
- **API Contract**: Pact or custom contract tests
- **Performance**: Artillery or k6

## 🎯 **Implementation Priority**

1. **Phase 1**: Unit tests for critical components
2. **Phase 2**: Integration tests for API endpoints
3. **Phase 3**: E2E tests for user journeys
4. **Phase 4**: Performance and contract tests

This strategy provides comprehensive coverage while maintaining development velocity and catching issues at the right level of the testing pyramid. 