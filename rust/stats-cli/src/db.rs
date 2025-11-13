use std::env;

use anyhow::{Context, Result};

pub fn build_database_url_from_env() -> Result<String> {
    let username = env_required("DB_USERNAME")?;
    let password = env_required("DB_PASSWORD")?;
    let schema = env_required("DB_SCHEMA")?;
    let host = env_required("DB_HOST")?;
    let port: u16 = env_required("DB_PORT")?
        .parse()
        .context("DB_PORT must be a valid integer")?;

    Ok(format!(
        "postgres://{}:{}@{}:{}/{}",
        username, password, host, port, schema
    ))
}

fn env_required(key: &str) -> Result<String> {
    env::var(key).with_context(|| format!("{} must be set in the environment", key))
}
