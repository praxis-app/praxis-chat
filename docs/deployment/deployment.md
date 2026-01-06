# Deployment

This document provides guidance for deploying Praxis to production, including environment configuration, database migration strategies, and step-by-step instructions for both first-time deployments and updates to existing instances.

## Prerequisites

Before deploying Praxis, you'll need to provision and configure a web server with the following components:

### Server Provisioning

Provision a Linux server (any distribution you prefer, such as Debian, Alma, or Rocky Linux). The server should have:

- Sufficient resources (CPU, RAM, and disk space) for your expected load
- Network access to allow incoming HTTP/HTTPS traffic
- SSH access for deployment and management

### Installing Docker and Docker Compose

Praxis uses Docker and Docker Compose to containerize the application and manage dependencies. Install Docker and Docker Compose on your server using the installation methods appropriate for your chosen Linux distribution.

### Installing a Reverse Proxy

Install a reverse proxy like Nginx (or another reverse proxy of your choice) to handle HTTP/HTTPS requests and route them to the Praxis application. Configure the reverse proxy to forward requests to the Praxis application running in Docker.

### Database and Redis

The database (PostgreSQL) and Redis are handled by Docker Compose and run as containers alongside the application—no separate installation or configuration is required for these services.

## Production Requirements

### Environment Variables

Set `DB_MIGRATIONS=true` for first-time deployments. After your first deployment, you may want to set `DB_MIGRATIONS=false` for subsequent deployments, depending on your migration strategy. Automatic migrations in production are often discouraged because they remove control over when migrations run, make it difficult to coordinate with deployments or rollbacks, and risk leaving the database in an inconsistent state if a migration fails.

Instead, run migrations manually as a separate step in your deployment process, allowing you to review, test, and apply them during appropriate maintenance windows.

### Running Migrations

For first-time deployments, see the [First-Time Deployment](#first-time-deployment) section below. For subsequent deployments, run migrations manually using `npm run typeorm:run` before deploying the application update.

## First-Time Deployment

When deploying the instance for the first time (initial setup):

1. Deploy the application with `DB_MIGRATIONS=true` set in your environment variables.

2. The application will automatically:
   - Run database migrations
   - Create the initial instance configuration
   - Create a default server

3. **Important**: Immediately after deployment, sign up as the first user on the server. This initial signup will:
   - Initialize admin roles for the instance
   - Initialize admin roles for the default server
   - Add you as a member to the default server

Without this initial admin signup, the instance will not have proper administrative access configured.

## Updating an Existing Deployment

For subsequent deployments (updates to an existing instance):

1. If you're using manual migrations, ensure `DB_MIGRATIONS=false` is set in your environment (or unset)
2. Review and test any new migrations in a staging environment first
3. Run migrations manually using `npm run typeorm:run` before or during your deployment window
4. Deploy the new version of the application
