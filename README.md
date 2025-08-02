# FitCoach AI

A personal AI fitness coach web application built with Vue.js frontend and Java Spring Boot backend, deployed using Docker containers and Nginx reverse proxy.

## 🌟 Features

- **AI Coaching**: Chat with your personal AI fitness coach
- **Personalized Workouts**: Get custom workout plans based on your goals
- **Nutrition Tracking**: Log meals and get nutritional insights
- **Progress Monitoring**: Track your fitness journey with visual charts
- **Responsive Design**: Works on both desktop and mobile
- **User Onboarding**: Multi-step onboarding process for personalized experience

## 🏗️ Tech Stack

- **Frontend**: Vue.js 3, Vuex 4, Vue Router 4, Chart.js, Axios
- **Backend**: Java 17, Spring Boot, Project Reactor
- **Deployment**: Docker, Docker Compose, Nginx
- **Styling**: CSS with custom variables and responsive design

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fitcoach-ai.git
   cd fitcoach-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run local development server**
   ```bash
   # Using npm
   npm run dev
   
   # Or using Docker (recommended)
   chmod +x run-local.sh
   ./run-local.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3000 (Docker) or http://localhost:8081 (npm)
   - Backend: http://localhost:8080 (make sure backend is running)

## 🐳 Docker Deployment

### Architecture Overview

```
Internet → fit.kish.rs:80 → Nginx → localhost:8080 (Frontend) / localhost:8081 (Backend)
```

### Port Configuration

| Service | Container Port | Server Port | External Access |
|---------|---------------|-------------|-----------------|
| Frontend | 80 | 8080 | http://fit.kish.rs |
| Backend | 8080 | 8081 | http://fit.kish.rs/api |
| Nginx | 80 | 80 | http://fit.kish.rs |

### Production Deployment

#### Frontend Deployment
```bash
# Build and push to Docker Hub
docker buildx build --platform linux/amd64 \
  --build-arg VITE_API_URL=http://fit.kish.rs/api \
  -t sreeramkumbham/fitness-assistant-frontend:latest \
  --push .

# Deploy on server
ssh root@your-server-ip
docker stop fa-f
docker rm fa-f
docker pull sreeramkumbham/fitness-assistant-frontend:latest
docker run -d -p 8080:80 --name fa-f sreeramkumbham/fitness-assistant-frontend:latest
sudo systemctl reload nginx
```

#### Backend Deployment
```bash
# Build and push to Docker Hub
docker buildx build --platform linux/amd64 \
  -t sreeramkumbham/fitness-assistant-backend:latest \
  --push .

# Deploy on server
ssh root@your-server-ip
docker stop fa-b
docker rm fa-b
docker pull sreeramkumbham/fitness-assistant-backend:latest
docker run -d -p 8081:8080 --name fa-b \
  -e OPENAI_API_KEY=your_openai_key_here \
  sreeramkumbham/fitness-assistant-backend:latest
```

### Nginx Configuration

Create `/etc/nginx/sites-available/fitness-coach`:
```nginx
server {
    listen 80;
    server_name fit.kish.rs;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy - route /api/ requests to backend on port 8081
    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Buffer settings to prevent header corruption
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend proxy - route all other requests to frontend on port 8080
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Handle static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -sf /etc/nginx/sites-available/fitness-coach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Frontend Shows Blank Page
**Symptoms**: Page loads but shows blank content
**Causes**: 
- Static assets not loading (wrong proxy port)
- API URL configuration issues
- JavaScript errors

**Solutions**:
```bash
# Check container logs
docker logs fa-f

# Check Nginx configuration
sudo nginx -t

# Verify static assets are being served
curl -I http://fit.kish.rs/assets/index-CBfy1VTE.js
```

#### 2. Onboarding Form Freezes
**Symptoms**: Form dropdowns and inputs become unresponsive
**Cause**: Circular dependency in Vue.js watchers

**Solution**: Use `:value` and `@input`/`@change` instead of `v-model`:
```javascript
// Fixed approach
:value="localFormData.gender"
@change="updateField('gender', $event.target.value)"
```

#### 3. Backend Host Header Errors
**Symptoms**: `The host [\fit.kish.rs] is not valid` in backend logs
**Cause**: Nginx not properly setting Host header

**Solution**: Add proper proxy headers in Nginx config (see above)

#### 4. API Endpoints Not Found
**Symptoms**: 404 errors for `/api/*` endpoints
**Cause**: Wrong `proxy_pass` configuration

**Solution**: Use `proxy_pass http://localhost:8081/api/;` (with trailing slash)

### Debugging Commands

```bash
# Check container status
docker ps
docker logs fa-f
docker logs fa-b

# Check Nginx status
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Test API endpoints
curl -I http://fit.kish.rs/api/auth/login
curl -I http://localhost:8081/api/auth/login

# Check port usage
netstat -tlnp | grep :8080
netstat -tlnp | grep :8081
```

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── OnboardingForm.vue  # Multi-step onboarding form
│   │   └── ...
│   ├── views/              # Page components
│   │   ├── LoginPage.vue
│   │   ├── SignupPage.vue
│   │   ├── OnboardingPage.vue
│   │   └── DashboardPage.vue
│   ├── api/                # API integration modules
│   │   ├── index.js        # Axios configuration
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── profile.js      # User profile endpoints
│   │   ├── workouts.js     # Workout endpoints
│   │   └── chat.js         # Chat/AI endpoints
│   ├── store/              # Vuex state management
│   ├── router/             # Vue Router configuration
│   └── assets/             # Static assets and styles
├── Dockerfile              # Frontend Docker configuration
├── nginx.conf              # Frontend Nginx configuration
├── docker-compose.yml      # Docker Compose configuration
├── run-local.sh            # Local development script
├── stop-local.sh           # Local cleanup script
└── README.md               # This file
```

## 🔑 Environment Variables

### Frontend
- `VITE_API_URL`: Backend API URL (set during Docker build)

### Backend
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `SPRING_PROFILES_ACTIVE`: Spring profile (prod/dev)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### User Profile
- `GET /api/auth/user/profile` - Get user profile
- `PUT /api/auth/user/profile` - Update user profile
- `POST /api/auth/user/onboarding` - Complete onboarding

### Workouts
- `GET /api/workouts/history` - Get workout history
- `GET /api/workouts/recommended` - Get recommended workouts
- `POST /api/workouts/track` - Track completed workout

### Chat/AI
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Send message to AI
- `POST /api/chat/generate-workout-plan` - Generate custom workout plan

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the AI coaching technology
- [Vue.js](https://vuejs.org/) for the frontend framework
- [Spring Boot](https://spring.io/projects/spring-boot) for the backend framework
- [Docker](https://www.docker.com/) for containerization
- [Nginx](https://nginx.org/) for reverse proxy and load balancing