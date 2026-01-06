# Deployment

## Production Requirements

### Environment Variables

For first-time deployments, ensure `DB_MIGRATIONS=true` is set in your production environment. This ensures database migrations run automatically on startup via `start-prod.sh` to create the initial database schema.

**Important**: After your first deployment, you should set `DB_MIGRATIONS=false` for subsequent deployments. Automatic migrations in production are often discouraged because they remove control over when migrations run, make it difficult to coordinate with deployments or rollbacks, and risk leaving the database in an inconsistent state if a migration fails.

Instead, run migrations manually as a separate step in your deployment process, allowing you to review, test, and apply them during appropriate maintenance windows.

### Running Migrations

For first-time deployments, migrations are handled automatically when `DB_MIGRATIONS=true` is set. The production startup script will run migrations before starting the application server.

For subsequent deployments, run migrations manually using `npm run typeorm:run` before deploying the application update.

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

1. Ensure `DB_MIGRATIONS=false` is set in your environment (or unset)
2. Review and test any new migrations in a staging environment first
3. Run migrations manually using `npm run typeorm:run` before or during your deployment window
4. Deploy the new version of the application
