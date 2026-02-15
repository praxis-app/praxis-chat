use chrono::{DateTime, Utc};
use owo_colors::OwoColorize;

const MAX_DAYS: i64 = 365 * 5;

pub fn normalize_window(days: i64) -> i32 {
    days.clamp(1, MAX_DAYS) as i32
}

pub fn format_number(value: i64) -> String {
    let sign = if value < 0 { "-" } else { "" };
    let mut digits: Vec<char> = value.abs().to_string().chars().collect();
    let mut i = digits.len() as isize - 3;
    while i > 0 {
        digits.insert(i as usize, ',');
        i -= 3;
    }
    format!("{sign}{}", digits.into_iter().collect::<String>())
}

pub fn color_stage(stage: &str) -> String {
    match stage {
        "voting" => stage.yellow().bold().to_string(),
        "ratified" => stage.green().bold().to_string(),
        "revision" => stage.blue().bold().to_string(),
        "closed" => stage.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

pub fn color_vote(vote: &str) -> String {
    match vote {
        "agree" => vote.green().bold().to_string(),
        "disagree" => vote.red().bold().to_string(),
        "abstain" => vote.cyan().bold().to_string(),
        "block" => vote.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

pub fn pct(count: i64, total: i64) -> f64 {
    if total > 0 {
        (count as f64 / total as f64) * 100.0
    } else {
        0.0
    }
}

pub fn print_header(text: &str, color: bool) {
    if color {
        println!("\n{}", text.bold());
    } else {
        println!("\n{}", text);
    }
}

pub fn print_section_label(text: &str, color: bool) {
    if color {
        println!("  {}", text.dimmed());
    } else {
        println!("  {}", text);
    }
}

pub fn humanize(ts: DateTime<Utc>) -> String {
    let now = Utc::now();
    let delta = now - ts;
    if delta.num_minutes() < 60 {
        format!("{}m ago", delta.num_minutes())
    } else if delta.num_hours() < 24 {
        format!("{}h ago", delta.num_hours())
    } else {
        format!("{}d ago", delta.num_days())
    }
}
