---
sidebar_position: 5
title: "🔐 Chapter 4: SSH Key Setup & Automated Deployment"
description: "GitHub Actions mein SSH Keys configure karne ka mukammal 4-step guide, Rsync setup aur automated production deployment Roman Urdu aur English mein."
---

# 🔐 Chapter 4: SSH Key Setup & Automated Deployment

SSH Key authentication configure karna DevOps pipeline ka sab se critical aur important hissa hota hai. Is guide mein hum step-by-step seekhein ge ke bina password ke GitHub Actions ko server se kaise connect kiya jata hai.

---

## 🔒 The Lock & Key Security Model

```mermaid
flowchart TD
    subgraph Local [1. Local Laptop]
        A[ssh-keygen Command] --> B[Private Key: Chaabi]
        A --> C[Public Key: Tala]
    end

    subgraph Server [2. Production Server]
        C -->|Paste in| D[~/.ssh/authorized_keys]
    end

    subgraph GitHub [3. GitHub Repository Secrets]
        B -->|Encrypted Secret| E[SSH_PRIVATE_KEY]
    end

    subgraph Pipeline [4. GitHub Actions Runner]
        E -->|Inject Key| F[~/.ssh/id_rsa: chmod 600]
        F -->|Authenticate & Sync| D
    end
```

1. **Server (Tala / Lock):** Server par **Public Key** (`.pub`) hoti hai jo `~/.ssh/authorized_keys` file mein add ki jati hai.
2. **GitHub (Chaabi / Key):** **Private Key** ko GitHub ke encrypted Secrets Vault mein save kiya jata hai.
3. **Pipeline Runner:** Deployment ke waqt runner secret chaabi ko load karta hai aur server ka tala khol kar files sync kar deta hai.

---

## 🛠️ Step 1: SSH Key Pair Generate Karna (Local Terminal)

Apne local laptop (Terminal / Git Bash / PowerShell) mein yeh command chalayein:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy-key"
```

* **`-t rsa`:** Key ka encryption algorithm (RSA).
* **`-b 4096`:** Key ki strength (4096 bits - highly secure).
* **`-C "..."`:** Identification label / comment.

### Interactive Prompts Handling:
1. `Enter file in which to save the key:`
   * Type karein: `github-actions-key` aur Enter dabayein.
2. `Enter passphrase (empty for no passphrase):`
   * **🚨 Bohat Ahem:** Ise **khali (empty)** chhor dein aur direct **Enter** press karein. Kyunki CI/CD runner automatic chalta hai aur wahan passphrase enter karne wala koi insaan nahi hota.
3. `Enter same passphrase again:`
   * Dobara direct **Enter** press karein.

**Result:** Aapke current folder mein 2 files ban jayein gi:
* `github-actions-key` ➔ **Private Key** (Secret Chaabi - kisi ke sath share na karein).
* `github-actions-key.pub` ➔ **Public Key** (Tala - server par lagane ke liye).

---

## 🖥️ Step 2: Public Key (Tala) Server par Install Karna

1. Apne laptop par public key ka content read aur copy karein:
   ```bash
   cat github-actions-key.pub
   ```
   *(Yeh `ssh-rsa AAAAB3NzaC1yc2E... github-actions-deploy-key` se start hoga)*

2. Apne **Production Server** par normal SSH se login karein:
   ```bash
   ssh ubuntu@YOUR_SERVER_IP
   ```

3. Server par `.ssh` folder aur `authorized_keys` file create / open karein:
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   ```

4. Apni copy ki hui **Public Key** ko aik nayi line mein paste kar dein.
5. Save karke exit karein (`Ctrl + O`, `Enter`, phir `Ctrl + X`).

6. Server par strict Linux permissions set karein:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

---

## 🔑 Step 3: Private Key (Chaabi) GitHub Secrets mein Save Karna

Ab hum secret chaabi ko GitHub repository ke secure vault mein save karein ge:

1. GitHub par apni **Repository** open karein.
2. Top menu se **Settings** par click karein.
3. Left sidebar mein **Secrets and variables** ➔ **Actions** select karein.
4. **New repository secret** button par click karein.

### Create the Following Secrets:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `SSH_PRIVATE_KEY` | Poori Private Key file ka content (Header & Footer samet) | `-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----` |
| `SSH_HOST` | Server ka Public IP Address ya Domain | `54.210.12.98` ya `app.example.com` |
| `SSH_USER` | Server ka SSH username | `ubuntu` ya `root` |
| `SSH_PORT` | SSH connection port (Default: 22) | `22` |

> ⚠️ **Important:** Private key copy karte waqt `-----BEGIN RSA PRIVATE KEY-----` aur `-----END RSA PRIVATE KEY-----` ki tamam lines include honi chahiyein.

---

## 🚀 Step 4: Professional Production YAML Workflow

Ab hum apni `.github/workflows/deploy.yml` file ko update karein ge jo SSH key ko automatically load karegi aur **`rsync`** ke zariye deployment karegi:

```yaml title=".github/workflows/deploy.yml"
name: Deploy Website to Server

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      # Step 1: Code Checkout
      - name: Code Download Karo
        uses: actions/checkout@v3

      # Step 2: Node.js Runtime Setup
      - name: Node Install Karo
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Step 3: Install Dependencies
      - name: Dependencies Install Karo
        run: npm install

      # Step 4: Run Tests
      - name: Tests Chalao
        run: npm test

      # Step 5: Production Build
      - name: Build Karo
        run: npm run build

      # =======================================================
      # ========== [ AUTOMATED SSH SETUP & RSYNC DEPLOY ] =====
      # =======================================================

      # Step 6: SSH Private Key Setup
      - name: SSH Key Setup Karo (Secret Chaabi Load)
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      # Step 7: Rsync Deployment
      - name: Deploy to Production Server
        run: |
          rsync -avz --delete ./build/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/var/www/website/
```

---

## 🔎 Deep Technical Explanation of SSH & Rsync Steps

### 1. SSH Setup Commands Breakdown

```bash
mkdir -p ~/.ssh
```
* **Explanation:** Runner machine ki home directory mein `.ssh` folder banata hai. `-p` flag error prevent karta hai agar folder pehle se bana ho.

```bash
echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
```
* **Explanation:** GitHub Secrets se encrypted private key nikal kar `~/.ssh/id_rsa` file mein write kar deta hai. `id_rsa` SSH ka default key filename hota hai.

```bash
chmod 600 ~/.ssh/id_rsa
```
* **Explanation (Bohat Critical):** Linux file permissions mein `600` ka matlab hai **sirf owner ko Read/Write ki ijazat**.
* **Kyun Zaroori Hai?** SSH client security policy ke mutabiq agar kisi private key ki permissions open hon (e.g. `777` ya `644`), toh SSH connection **"UNPROTECTED PRIVATE KEY FILE!"** ka error de kar refuse kar deta hai.

```bash
ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
```
* **Explanation:** Jab aap pehli baar kisi naye server se connect karte hain, Linux poochta hai: *"The authenticity of host can't be established. Are you sure you want to continue (yes/no)?"*. CI/CD runner par koi human 'yes' type nahi kar sakta, isliye `ssh-keyscan` pehle se server ka cryptographic fingerprint nikal kar `known_hosts` file mein register kar deta hai.

---

### 2. Rsync Deployment Command Breakdown

```bash
rsync -avz --delete ./build/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/var/www/website/
```

| Flag / Parameter | Roman Urdu Explanation | English Meaning |
| :--- | :--- | :--- |
| **`rsync`** | `scp` ka modern aur super fast version jo sirf modified files bhejta hai. | Remote file synchronization tool. |
| **`-a` (Archive)** | Files ki permissions, timestamps aur directory structure ko preserve rakhta hai. | Archive mode; preserves file metadata. |
| **`-v` (Verbose)** | Console par copy hone wali har file ka naam print karta hai (Debugging). | Verbose console output. |
| **`-z` (Compress)** | Network transfer ke doraan files ko compress karta hai (Fast speed). | Compresses file data during transfer. |
| **`--delete`** | **Powerful Flag:** Agar aapne local build se koi purani file delete ki hai, toh server ke folder se bhi woh delete ho jati hai taake server saaf rahe. | Deletes remote files that no longer exist in source. |
| **`./build/`** | Source directory jahan compiled web files mojood hain. | Source directory path. |
| **`user@host:/path`** | Target server ka destination web root folder. | Target server destination path. |

---

## 📋 Complete Setup Summary Checklist

1. [x] Local terminal par `ssh-keygen` se 4096-bit RSA key generate ki.
2. [x] Server ke `~/.ssh/authorized_keys` mein public key paste ki (`chmod 600`).
3. [x] GitHub repository Settings mein `SSH_PRIVATE_KEY` aur `SSH_HOST` secrets create kiye.
4. [x] Workflow YAML file mein `chmod 600 ~/.ssh/id_rsa` aur `ssh-keyscan` add kiya.
5. [x] `rsync -avz --delete` ke zariye files `/var/www/website/` par sync kiyein.

---

> ⏭️ **Agla Qadam:** Aaiye **[Chapter 5: Complete Git & GitHub Commands Cheat Sheet](./05-git-and-github-commands-cheatsheet.md)** mein daily development aur advanced Git management ke tamam zaroori commands ko explore karte hain!
