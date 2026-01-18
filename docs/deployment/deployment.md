# Deployment

This document provides guidance for deploying Praxis to production, including server setup, environment configuration, and database migration strategies.

## Prerequisites

Before deploying Praxis, ensure you have:

- A Linux server (Ubuntu recommended) with SSH access
- A registered domain name
- Basic familiarity with the command line

## Server Provisioning

Create a new server with the following specifications:

- **OS**: Latest Ubuntu LTS
- **Region**: Choose based on your target users
- **Size**: Minimum 2GB RAM recommended

After provisioning, verify SSH access:

```bash
ssh root@<IP_ADDRESS>
```

Set up SSH key authentication for passwordless login:

```bash
ssh-copy-id root@<IP_ADDRESS>
```

Update the system:

```bash
apt update && apt upgrade -y
```

## Security Configuration

### Create Non-Root User

```bash
useradd -m admin
passwd admin
```

### Configure Firewall (UFW)

```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

### Disable SSH Root Login

Edit `/etc/ssh/sshd_config` and set:

```
PermitRootLogin no
```

Restart SSH service to apply changes.

## Install Docker

Install Docker and Docker Compose following the [official Docker documentation](https://docs.docker.com/engine/install/ubuntu/):

```bash
sudo apt-get install ca-certificates curl gnupg lsb-release

sudo mkdir -m 0755 -p /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Install Nginx

```bash
apt install nginx
```

## Install Certbot (SSL)

```bash
sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## Nginx Configuration

### Set Up Server Block

Create the web root directory:

```bash
sudo mkdir -p /var/www/example.com/html
sudo chown -R $USER:$USER /var/www/example.com/html
sudo chmod -R 755 /var/www/example.com
```

Create a test page at `/var/www/example.com/html/index.html` to verify Nginx is working:

```html
<html>
  <head>
    <title>Welcome to example.com!</title>
  </head>
  <body>
    <h1>Success! The server block is working!</h1>
  </body>
</html>
```

### Configure Domain

1. Point your domain's DNS A record to your server's IP address
2. Copy the application's Nginx config to the sites-available directory:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/example.com
```

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
```

## SSL Certificate

Obtain an SSL certificate with Certbot:

```bash
sudo certbot certonly --nginx -d example.com -d www.example.com
```

After running Certbot, revert any changes it made to your `nginx.conf` if needed.

Restart Nginx:

```bash
service nginx restart
```

## Application Deployment

### Clone Repository

```bash
git clone https://github.com/praxis-app/praxis-chat.git
cd praxis-chat
```

### Environment Configuration

Create a `.env` file with your configuration. **Use a strong, unique password for PostgreSQL.**

> **Warning**: Failing to set a secure database password can result in your server being compromised.

### Start the Application

Build and start the Docker containers:

```bash
sudo docker compose up -d
```

## Database Migrations

### First-Time Deployment

For initial setup, deploy with `DB_MIGRATIONS=true` in your environment variables. The application will automatically:

- Run database migrations
- Create the initial instance configuration
- Create a default server

**Important**: Immediately after deployment, sign up as the first user. This initial signup will:

- Initialize admin roles for the instance
- Initialize admin roles for the default server
- Add you as a member to the default server

### Running Migrations Manually

If you prefer manual control over migrations:

1. Get the API container ID:

```bash
sudo docker ps
```

2. SSH into the container:

```bash
sudo docker exec -it <CONTAINER_ID> sh
```

3. Run migrations:

```bash
cd app && npm run typeorm:run ./dist/database/data-source.js
```

### Updating an Existing Deployment

For subsequent deployments:

1. Set `DB_MIGRATIONS=false` (or unset) if using manual migrations
2. Review and test new migrations in a staging environment
3. Run migrations manually before deploying the new version
4. Deploy the application update
