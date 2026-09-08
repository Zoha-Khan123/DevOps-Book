---
sidebar_position: 8
title: "🚀 Chapter 7: YAML Syntax & Production Actions Templates"
description: "Complete YAML syntax, Production CI/CD Pipelines, Docker automated builds, Multi-environment, Cron jobs aur Reusable Workflows Roman Urdu aur English mein."
---

# 🚀 Chapter 7: YAML Syntax & Production Actions Templates

Is chapter mein hum YAML ke syntax rules aur industry-standard production-grade GitHub Actions pipeline templates ko explore karein ge.

---

## 📄 1. YAML Syntax Essentials

YAML (YAML Ain't Markup Language) ek human-readable data serialization language hai:

```yaml title="syntax-example.yml"
# 1. Comments '#' symbol se shuru hote hain

# 2. Key-Value Pairs
app_name: MyWebApp
port: 8080
is_production: true

# 3. Lists / Arrays (- dash symbol se)
allowed_roles:
  - admin
  - developer
  - tester

# 4. Nested Objects (Indentation 2 spaces se hoti hai - Tab use na karein!)
database:
  host: 127.0.0.1
  port: 5432
  credentials:
    username: db_user

# 5. Multiline Strings ('|' symbol nayi lines ko preserve rakhta hai)
deployment_script: |
  echo "Step 1: Starting build"
  echo "Step 2: Uploading files"
  echo "Step 3: Service restart"
```

---

## 📦 2. Production Template: Full Node.js CI Pipeline (Matrix & Cache)

Yeh pipeline multiple Node.js versions par parallel testing karti hai aur `npm cache` use karti hai taake build fast ho:

```yaml title=".github/workflows/ci.yml"
name: Production CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Build & Test Matrix
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20, 22]
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      # Dependencies caching taake baar baar download na karni parein
      - name: Cache Node Modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Install Clean Dependencies
        run: npm ci
      
      - name: Run Code Linter
        run: npm run lint
      
      - name: Run Test Suite
        run: npm test
```

---

## 🚀 3. Production Template: Full CD Pipeline with SSH, Nginx & Slack

Yeh pipeline testing ke baad build banati hai, SSH ke zariye files upload karti hai, Nginx restart karti hai aur team ko Slack notification bhejti hai:

```yaml title=".github/workflows/deploy.yml"
name: Deploy to Production Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Production Deployment
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies & Build
        run: |
          npm ci
          npm test
          npm run build
      
      # SSH Key Configuration
      - name: Setup SSH Keys
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
      
      # Sync files to web server
      - name: Deploy with Rsync
        run: |
          rsync -avz --delete ./build/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/var/www/website/
      
      # Remote server service restart
      - name: Reload Nginx Web Server
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "sudo systemctl reload nginx"
      
      # Slack Notification (Success / Failure)
      - name: Send Slack Notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production Deployment: ${{ job.status == "success" && "✅ Succeeded" || "❌ Failed" }}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐳 4. Production Template: Docker Build & Push CI/CD

Yeh workflow application ka Docker image banata hai, Docker Hub par push karta hai aur remote server par containers update karta hai:

```yaml title=".github/workflows/docker-deploy.yml"
name: Docker Build & Deploy

on:
  push:
    branches: [ main ]

jobs:
  docker:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/my-app:latest
            ${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}
      
      # Remote server execution
      - name: Deploy via Docker Compose on Server
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
          
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd /opt/app
            docker compose pull
            docker compose up -d --remove-orphans
          EOF
```

---

## 🌐 5. Production Template: Multi-Environment Deployment (Staging vs Prod)

```yaml title=".github/workflows/multi-env.yml"
name: Multi-Environment Deployment

on:
  push:
    branches:
      - develop
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Detect Target Environment
        id: env_detector
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "env_name=production" >> $GITHUB_OUTPUT
            echo "host=${{ secrets.PROD_HOST }}" >> $GITHUB_OUTPUT
          else
            echo "env_name=staging" >> $GITHUB_OUTPUT
            echo "host=${{ secrets.STAGING_HOST }}" >> $GITHUB_OUTPUT
          fi
      
      - name: Deploying Application
        run: |
          echo "Deploying to Environment: ${{ steps.env_detector.outputs.env_name }}"
          echo "Target Server IP: ${{ steps.env_detector.outputs.host }}"
```

---

## ⏰ 6. Production Template: Scheduled Cron Automation (Automated Backups)

```yaml title=".github/workflows/backup.yml"
name: Daily Server Database & Files Backup

on:
  schedule:
    - cron: '0 0 * * *'    # Har raat midnight (00:00 UTC) par chalega
    - cron: '0 */6 * * *'  # Ya har 6 ghante baad

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
      
      - name: Trigger Remote Backup Archive
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "tar -czf /backup/web_backup_\$(date +%Y%m%d).tar.gz /var/www/website"
```

---

## 🔄 7. Reusable Workflows Pattern (`workflow_call`)

Reusable workflows aapko multiple repositories aur pipelines mein same logic share karne ki ijazat dete hain:

```yaml title=".github/workflows/reusable-deploy.yml"
name: Reusable Deploy Template

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      node_version:
        required: false
        type: string
        default: '18'
    secrets:
      SSH_PRIVATE_KEY:
        required: true
      SSH_HOST:
        required: true
      SSH_USER:
        required: true

jobs:
  deploy_task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploying to ${{ inputs.environment }}
        run: echo "Successfully deploying to ${{ inputs.environment }}"
```

### Main Caller Workflow:
```yaml title=".github/workflows/main.yml"
name: Main App Pipeline

on: [push]

jobs:
  call-deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      node_version: '20'
    secrets:
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      SSH_HOST: ${{ secrets.STAGING_HOST }}
      SSH_USER: ${{ secrets.SSH_USER }}
```

---

## 📊 Quick Reference Cheat Sheet Tables

### GitHub Actions Triggers Reference

| Trigger Name | Syntax Example | When Does It Fire? |
| :--- | :--- | :--- |
| **Push** | `on: push` | Kisi bhi commit push par |
| **Pull Request** | `on: pull_request` | Naya PR open ya update hone par |
| **Schedule (Cron)** | `on: schedule: - cron: '0 2 * * *'` | Muqarrara waqt par automatically |
| **Manual Dispatch** | `on: workflow_dispatch` | GitHub UI mein button click karne par |
| **Release** | `on: release: types: [created]` | Naya GitHub tag release publish hone par |

---

## 🎯 Pro Pipeline Optimizations

1. **Conditional Step Execution (`if:`):**
   ```yaml
   - name: Run only on main branch
     if: github.ref == 'refs/heads/main'
     run: echo "Production deployment running..."
   ```

2. **Step Timeout Limit:**
   ```yaml
   - name: Build Project
     timeout-minutes: 10 # Stuck processes ko kill karega
     run: npm run build
   ```

3. **Ignore Non-Fatal Step Errors:**
   ```yaml
   - name: Optional Health Check
     continue-on-error: true
     run: curl -f https://my-site.com/health
   ```

---

> 🎉 **Mubarak Ho!** Aapne DevOps, Git, GitHub, CI/CD, SSH Authentication aur GitHub Actions YAML ka mukammal course complete kar liya hai!
