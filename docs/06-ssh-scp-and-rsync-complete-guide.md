---
sidebar_position: 7
title: "🛡️ Chapter 6: SSH, SCP & Rsync Complete Reference Guide"
description: "Secure Shell (SSH), SCP file transfer aur Rsync mirroring ka mukammal guide Roman Urdu aur English mein."
---

# 🛡️ Chapter 6: SSH, SCP & Rsync Complete Reference Guide

DevOps engineering mein remote servers ko secure tarike se manage karna aur files sync karna rozana ka kaam hota hai. Is guide mein hum **SSH**, **SCP** aur **Rsync** ke tamam aspects ko cover karein ge.

---

## 🔑 1. SSH Key Generation & Types

```bash
# Standard 4096-bit RSA Key generate karein (Universal support)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Ed25519 Key generate karein (Modern, compact aur extra fast)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Specific filename aur path ke sath key generate karein
ssh-keygen -t rsa -b 4096 -f ~/.ssh/production_server_key -C "Production Deploy Key"
```

---

## 📁 2. SSH Files & Strict Linux Permissions

Linux operating system mein SSH permissions ka bohat strict protocol hota hai. Agar permissions galat hon toh connection foran fail ho jata hai:

```bash
# SSH directory contents check karein
ls -la ~/.ssh/

# Public Key content dekhein
cat ~/.ssh/id_rsa.pub

# Private Key content dekhein (Hamesha confidential rakhein)
cat ~/.ssh/id_rsa
```

### 🔒 Standard Permissions Matrix

| File / Folder | Meaning | Permission Code | Command |
| :--- | :--- | :--- | :--- |
| `~/.ssh/` folder | Directory read/write/execute sirf owner ke liye | `700` (`rwx------`) | `chmod 700 ~/.ssh` |
| `id_rsa` (Private Key) | Read/Write sirf owner ke liye | `600` (`rw-------`) | `chmod 600 ~/.ssh/id_rsa` |
| `id_rsa.pub` (Public Key) | Read/Write owner, Read baqi sab | `644` (`rw-r--r--`) | `chmod 644 ~/.ssh/id_rsa.pub` |
| `authorized_keys` | Read/Write sirf owner ke liye | `600` (`rw-------`) | `chmod 600 ~/.ssh/authorized_keys` |
| `config` | Read/Write sirf owner ke liye | `600` (`rw-------`) | `chmod 600 ~/.ssh/config` |

---

## 🖥️ 3. Server par Public Key Install Karna

### Method A: Automatic Method (`ssh-copy-id`)
Agar aapke paas server ka password mojood hai:

```bash
# Default key copy karein
ssh-copy-id user@server-ip

# Specific public key copy karein
ssh-copy-id -i ~/.ssh/production_server_key.pub user@server-ip
```

### Method B: Manual Method (Direct on Server)
```bash
# Server par login karein
ssh user@server-ip

# Authorized keys file banayein aur key paste karein
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# (Public key paste karein aur save karein)

# Permissions lock karein
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 🔌 4. SSH Connection & Remote Execution

```bash
# Basic SSH connection
ssh user@server-ip

# Custom port (e.g., 2222) par connect karein
ssh -p 2222 user@server-ip

# Specific private key ke sath connect karein
ssh -i ~/.ssh/production_server_key user@server-ip

# Verbose Debugging Mode (Connection issues troubleshoot karne ke liye)
ssh -v user@server-ip

# Remote server par single command execute karein (Bina interactive login ke)
ssh user@server-ip "ls -la /var/www && df -h"

# Multiple lines ka complex bash script remote server par execute karein
ssh user@server-ip << 'EOF'
cd /var/www/website
git pull origin main
npm install --production
sudo systemctl restart nginx
EOF
```

---

## 📦 5. SCP (Secure Copy Protocol)

`scp` utility files ko SSH tunnel ke zariye remotely copy karne ke liye use hoti hai:

```bash
# 1. Local computer se remote server par single file bhejna
scp app.zip user@server-ip:/var/www/website/

# 2. Remote server se file apne local computer par download karna
scp user@server-ip:/var/log/nginx/error.log ./local_logs/

# 3. Poora folder copy karna (-r recursive)
scp -r ./dist/ user@server-ip:/var/www/website/

# 4. Multiple files ek sath transfer karna
scp file1.js file2.css user@server-ip:/var/www/website/

# 5. Non-standard port specify karna (Capital -P)
scp -P 2222 app.tar.gz user@server-ip:/backup/
```

---

## 🔄 6. Rsync (Remote Sync - The Modern Standard)

DevOps aur CI/CD pipelines mein `scp` ke bajaye hamesha **`rsync`** use kiya jata hai kyunki yeh **Delta Transfer Algorithm** use karta hai (yani agar 1000 files mein se sirf 1 file change hui hai, toh yeh sirf wahi 1 file transfer karega).

```bash
# 1. Standard Production Sync
rsync -avz ./build/ user@server-ip:/var/www/website/

# 2. Dry Run Mode (Pehle test karein ke kya kya copy hoga bina asal changes kiye)
rsync -avz --dry-run ./build/ user@server-ip:/var/www/website/

# 3. Mirror Sync (--delete flag ke sath: jo files local build se delete hon woh server se bhi delete ho jayein)
rsync -avz --delete ./build/ user@server-ip:/var/www/website/

# 4. Unwanted files aur folders exclude karna
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.env' ./ user@server-ip:/var/www/app/

# 5. Custom SSH key aur custom port ke sath rsync chalana
rsync -avz -e "ssh -i ~/.ssh/my_key.pem -p 2222" ./build/ user@server-ip:/var/www/website/
```

---

## ⚙️ 7. SSH Config File (`~/.ssh/config`)

Roz-marrah lambi IP addresses aur key paths likhne ke bajaye aap shortcut aliases bana sakte hain:

```bash
# Config file create / edit karein
nano ~/.ssh/config
```

```text title="~/.ssh/config"
# Staging Server Shortcut
Host staging
    HostName 192.168.1.50
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa

# Production Server Shortcut
Host prod
    HostName 54.210.12.98
    User root
    Port 2222
    IdentityFile ~/.ssh/prod_rsa
```

**Ab aap simply terminal mein likhein ge:**
```bash
ssh prod        # Direct connects to production!
ssh staging     # Direct connects to staging!
```

---

## 🔐 8. SSH Agent (Memory Key Management)

Agar aapki private key passphrase-protected hai aur aap baar baar passphrase nahi likhna chahte:

```bash
# SSH Agent background process start karein
eval "$(ssh-agent -s)"

# Key ko agent ki memory mein add karein
ssh-add ~/.ssh/id_rsa

# Agent mein load shuda keys ki list dekhein
ssh-add -l

# Agent se saari keys remove karein
ssh-add -D
```

---

## 💡 9. Advanced SSH Pro Tips

* **GitHub SSH Connection Test:**
  ```bash
  ssh -T git@github.com
  # Output: Hi username! You've successfully authenticated...
  ```
* **Keep Alive Connection (SSH disconnect hone se bachayein):**
  ```bash
  ssh -o ServerAliveInterval=60 user@server-ip
  ```
* **Bastion / Jump Host ke zariye Private Subnet Server se connect hona:**
  ```bash
  ssh -J bastion-user@bastion-ip private-user@private-internal-ip
  ```

---

> ⏭️ **Agla Qadam:** Aaiye **[Chapter 7: YAML Syntax & Production Actions Templates](./07-yaml-and-production-actions-templates.md)** mein complex CI/CD pipelines, Docker containerization, matrix builds aur cron scheduled jobs ko cover karte hain!
