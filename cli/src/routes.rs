use std::collections::{HashMap, HashSet};
use std::io::IsTerminal;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use glob::glob;
use owo_colors::OwoColorize;
use regex::Regex;

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

/// A single leaf route (e.g. `.get('/foo', handler)`)
#[derive(Debug, Clone)]
struct LeafRoute {
    method: String,
    path: String,
}

/// A mount call (e.g. `.use('/path', someRouter)`)
#[derive(Debug, Clone)]
struct MountCall {
    path: String,
    router_name: String,
}

/// Everything we extract from a single `.router.ts` (or `main.ts`) file.
#[derive(Debug, Clone)]
struct ParsedRouter {
    /// The exported router variable name (e.g. `appRouter`)
    name: String,
    /// Leaf routes defined directly on this router
    leaf_routes: Vec<LeafRoute>,
    /// Child routers mounted via `.use()`
    mount_calls: Vec<MountCall>,
}

/// A tree node used for the `--tree` output.
#[derive(Debug)]
struct RouterNode {
    mount_path: String,
    leaf_routes: Vec<LeafRoute>,
    children: Vec<RouterNode>,
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

pub fn run_routes(path_filter: Option<String>, tree: bool) -> Result<()> {
    let color = std::io::stdout().is_terminal();
    let src_dir = find_src_dir()?;

    let registry = build_registry(&src_dir)?;

    let root = build_tree("/api", "appRouter", &registry, &mut HashSet::new());

    if tree {
        print_tree(&root, path_filter.as_deref(), 0, color);
    } else {
        print_flat(&root, path_filter.as_deref(), color);
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Locate src/ directory
// ---------------------------------------------------------------------------

fn find_src_dir() -> Result<PathBuf> {
    let cwd = std::env::current_dir()?;

    // Running from repo root: look for src/main.ts as a marker
    let candidate = cwd.join("src");
    if candidate.join("main.ts").exists() {
        return Ok(candidate);
    }

    // Running from cli/: look for ../src/main.ts
    let candidate = cwd.join("../src");
    if candidate.join("main.ts").exists() {
        return Ok(candidate.canonicalize()?);
    }

    anyhow::bail!(
        "Could not find src/ directory. Run from the repository root or the cli/ directory."
    );
}

// ---------------------------------------------------------------------------
// Build registry of all routers
// ---------------------------------------------------------------------------

fn build_registry(src_dir: &Path) -> Result<HashMap<String, ParsedRouter>> {
    let mut registry = HashMap::new();

    // Glob for all *.router.ts files
    let pattern = src_dir.join("**/*.router.ts");
    let pattern_str = pattern.to_string_lossy();
    for entry in glob(&pattern_str).context("failed to read glob pattern")? {
        let file_path = entry?;
        let routers = parse_file(&file_path)?;
        for router in routers {
            registry.insert(router.name.clone(), router);
        }
    }

    // Also parse main.ts to find `app.use('/api', appRouter)`
    let main_ts = src_dir.join("main.ts");
    if main_ts.exists() {
        let routers = parse_file(&main_ts)?;
        for router in routers {
            registry.insert(router.name.clone(), router);
        }
    }

    Ok(registry)
}

// ---------------------------------------------------------------------------
// Parse a single TypeScript file
// ---------------------------------------------------------------------------

fn parse_file(file_path: &Path) -> Result<Vec<ParsedRouter>> {
    let content = std::fs::read_to_string(file_path)
        .with_context(|| format!("failed to read {}", file_path.display()))?;

    let is_main = file_path
        .file_name()
        .map(|n| n == "main.ts")
        .unwrap_or(false);

    // --- Extract local constants: `const FOO = '/path'` or `const FOO = "/path"`
    let const_re =
        Regex::new(r#"(?m)^(?:export\s+)?const\s+(\w+)\s*=\s*['"]([^'"]+)['"]"#).unwrap();
    let mut constants: HashMap<String, String> = HashMap::new();
    for cap in const_re.captures_iter(&content) {
        constants.insert(cap[1].to_string(), cap[2].to_string());
    }

    // --- Extract router declarations
    //     `export const fooRouter = express.Router(...)`
    let router_decl_re =
        Regex::new(r"(?m)(?:export\s+)?const\s+(\w+Router)\s*=\s*express\.Router").unwrap();

    let mut routers: Vec<ParsedRouter> = Vec::new();

    if is_main {
        // For main.ts, create a synthetic router that captures `app.use('/api', appRouter)`
        let mut main_router = ParsedRouter {
            name: "__main__".to_string(),
            leaf_routes: Vec::new(),
            mount_calls: Vec::new(),
        };

        let app_use_re =
            Regex::new(r#"app\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+Router)\s*\)"#).unwrap();
        for cap in app_use_re.captures_iter(&content) {
            main_router.mount_calls.push(MountCall {
                path: cap[1].to_string(),
                router_name: cap[2].to_string(),
            });
        }

        routers.push(main_router);
    }

    // Find all router variable names declared in this file
    let declared_names: Vec<String> = router_decl_re
        .captures_iter(&content)
        .map(|cap| cap[1].to_string())
        .collect();

    if declared_names.is_empty() && !is_main {
        return Ok(routers);
    }

    // For each declared router, collect its leaf routes and mount calls.
    // Since multiple routers can be in one file (e.g. invites.router.ts has
    // both invitesRouter and serverInvitesRouter), we need to associate routes
    // with the correct router. We do this by tracking which router name
    // appears before each route definition.

    for router_name in &declared_names {
        let mut parsed = ParsedRouter {
            name: router_name.clone(),
            leaf_routes: Vec::new(),
            mount_calls: Vec::new(),
        };

        // Match leaf routes: routerName.get(...), routerName.post(...), etc.
        // Also match chained routes after `.use(...)` on the same router.
        extract_routes_for_router(&content, router_name, &constants, &mut parsed);

        routers.push(parsed);
    }

    Ok(routers)
}

/// Extract leaf routes and mount calls for a specific router variable.
fn extract_routes_for_router(
    content: &str,
    router_name: &str,
    constants: &HashMap<String, String>,
    parsed: &mut ParsedRouter,
) {
    // Split content into statement blocks that reference this router.
    // A block starts with `routerName` at the beginning of a line and
    // continues through chained calls until a line that doesn't start
    // with whitespace or a dot (indicating a new statement).
    let blocks = extract_router_blocks(content, router_name);

    let use_mount_re = Regex::new(r#"\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+Router)\s*\)"#).unwrap();

    for block in &blocks {
        // Extract mount calls
        for cap in use_mount_re.captures_iter(block) {
            parsed.mount_calls.push(MountCall {
                path: cap[1].to_string(),
                router_name: cap[2].to_string(),
            });
        }

        // Extract leaf routes
        extract_leaf_routes(block, constants, &mut parsed.leaf_routes);
    }

    // Deduplicate mount calls
    let mut seen_mounts = HashSet::new();
    parsed.mount_calls.retain(|m| {
        let key = format!("{}:{}", m.path, m.router_name);
        seen_mounts.insert(key)
    });

    // Deduplicate leaf routes
    let mut seen_routes = HashSet::new();
    parsed.leaf_routes.retain(|r| {
        let key = format!("{}:{}", r.method, r.path);
        seen_routes.insert(key)
    });
}

/// Extract contiguous code blocks that start with the given router name.
/// Each block starts with `routerName.` or `routerName\n` and continues
/// through chained method calls (lines starting with `.` or whitespace).
fn extract_router_blocks(content: &str, router_name: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let lines: Vec<&str> = content.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let trimmed = lines[i].trim();
        if trimmed.starts_with(router_name)
            && (trimmed.len() == router_name.len()
                || trimmed[router_name.len()..].starts_with('.')
                || trimmed[router_name.len()..].starts_with('\n'))
        {
            let mut block = String::from(lines[i]);
            i += 1;
            // Continue collecting lines that are part of this chained statement
            while i < lines.len() {
                let next = lines[i];
                let next_trimmed = next.trim();
                // Continuation: indented lines, lines starting with `.`, or closing parens
                if next.starts_with(' ')
                    || next.starts_with('\t')
                    || next_trimmed.starts_with('.')
                    || next_trimmed.starts_with(')')
                    || next_trimmed.starts_with(',')
                    || next_trimmed.is_empty()
                {
                    block.push('\n');
                    block.push_str(next);
                    i += 1;
                } else {
                    break;
                }
            }
            blocks.push(block);
        } else {
            i += 1;
        }
    }

    blocks
}

/// Extract leaf routes (.get, .post, .put, .delete) from a text block.
fn extract_leaf_routes(
    block: &str,
    constants: &HashMap<String, String>,
    routes: &mut Vec<LeafRoute>,
) {
    // Match: .get('/path', ...) or .post('/path', ...) etc.
    // Path can be a string literal, template literal, or variable reference
    let route_re = Regex::new(
        r#"\.(get|post|put|delete|patch)\(\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|(\w+))\s*,"#,
    )
    .unwrap();

    for cap in route_re.captures_iter(block) {
        let method = cap[1].to_uppercase();
        let raw_path = cap
            .get(2)
            .or(cap.get(3))
            .or(cap.get(4))
            .or(cap.get(5))
            .map(|m| m.as_str().to_string())
            .unwrap_or_default();

        let path = resolve_path(&raw_path, constants);
        routes.push(LeafRoute { method, path });
    }
}

/// Resolve template literal interpolations and variable references to their
/// constant values. E.g. `${IMAGE_ROUTE}/upload` becomes `/:messageId/images/:imageId/upload`.
fn resolve_path(raw: &str, constants: &HashMap<String, String>) -> String {
    // Handle template literal interpolation: ${VAR_NAME}
    let interpolation_re = Regex::new(r"\$\{(\w+)\}").unwrap();
    let resolved = interpolation_re.replace_all(raw, |caps: &regex::Captures| {
        let var_name = &caps[1];
        constants.get(var_name).cloned().unwrap_or(raw.to_string())
    });

    let resolved = resolved.to_string();

    // If the entire path is a single identifier (variable reference), resolve it
    if !resolved.starts_with('/') && !resolved.is_empty() {
        if let Some(value) = constants.get(&resolved) {
            return value.clone();
        }
    }

    resolved
}

// ---------------------------------------------------------------------------
// Build the route tree
// ---------------------------------------------------------------------------

fn build_tree(
    mount_path: &str,
    router_name: &str,
    registry: &HashMap<String, ParsedRouter>,
    visited: &mut HashSet<String>,
) -> RouterNode {
    let mut node = RouterNode {
        mount_path: mount_path.to_string(),
        leaf_routes: Vec::new(),
        children: Vec::new(),
    };

    if !visited.insert(router_name.to_string()) {
        return node; // Circular reference guard
    }

    if let Some(parsed) = registry.get(router_name) {
        node.leaf_routes = parsed.leaf_routes.clone();

        for mount in &parsed.mount_calls {
            let child = build_tree(&mount.path, &mount.router_name, registry, visited);
            node.children.push(child);
        }
    }

    visited.remove(router_name);
    node
}

// ---------------------------------------------------------------------------
// Flat output
// ---------------------------------------------------------------------------

/// A route tagged with its position in the mount hierarchy.
struct FlatRoute {
    full_path: String,
    method: String,
    /// Mount prefix of the router that owns this route
    section: String,
    /// Breadcrumb trail of resource names (e.g. ["servers", "channels", "messages"])
    breadcrumb: Vec<String>,
}

fn print_flat(root: &RouterNode, path_filter: Option<&str>, color: bool) {
    let mut routes: Vec<FlatRoute> = Vec::new();
    collect_flat_routes(root, "", None, &mut routes);

    // Sort by section path first to keep sub-resources grouped under their
    // parent, then by full path and method within each section
    routes.sort_by(|a, b| {
        a.section
            .cmp(&b.section)
            .then(a.full_path.cmp(&b.full_path))
            .then(a.method.cmp(&b.method))
    });

    // Apply filter
    if let Some(filter) = path_filter {
        routes.retain(|r| r.full_path.contains(filter));
    }

    if routes.is_empty() {
        println!("No routes found.");
        return;
    }

    if color {
        println!("\n{}", "API Routes".bold().underline());
    } else {
        println!("\nAPI Routes");
    }

    let mut current_section = String::new();
    for route in &routes {
        if route.section != current_section {
            current_section = route.section.clone();
            print_section_header(&route.breadcrumb, color);
        }

        if color {
            let colored_method = colorize_method(&route.method);
            println!("    {:<8} {}", colored_method, route.full_path);
        } else {
            println!("    {:<8} {}", route.method, route.full_path);
        }
    }

    let count = routes.len();
    if color {
        println!(
            "\n{} {}",
            format!("{}", count).bold(),
            "routes total".dimmed()
        );
    } else {
        println!("\n{} routes total", count);
    }
}

fn print_section_header(breadcrumb: &[String], color: bool) {
    if color {
        let parts: Vec<String> = breadcrumb
            .iter()
            .enumerate()
            .map(|(i, name)| {
                if i == breadcrumb.len() - 1 {
                    name.bold().to_string()
                } else {
                    name.dimmed().to_string()
                }
            })
            .collect();
        let separator = " > ".dimmed().to_string();
        println!("\n  {}", parts.join(&separator));
    } else {
        println!("\n  {}", breadcrumb.join(" > "));
    }
}

/// Extract resource name from a mount path (e.g. "/:serverId/channels" -> "channels")
fn mount_path_resource(mount_path: &str) -> String {
    mount_path
        .split('/')
        .filter(|s| !s.is_empty() && !s.starts_with(':'))
        .last()
        .unwrap_or("root")
        .to_string()
}

fn collect_flat_routes(
    node: &RouterNode,
    prefix: &str,
    parent_breadcrumb: Option<&[String]>,
    routes: &mut Vec<FlatRoute>,
) {
    let current_path = normalize_path(&format!("{}{}", prefix, node.mount_path));

    // Build breadcrumb for this node.
    // The root /api node passes `None` so its children start fresh
    // with just their own resource name (e.g. ["servers"] not ["api", "servers"]).
    let effective_breadcrumb: Vec<String> = match parent_breadcrumb {
        None => Vec::new(),
        Some(bc) => {
            let mut new_bc = bc.to_vec();
            new_bc.push(mount_path_resource(&node.mount_path));
            new_bc
        }
    };

    for leaf in &node.leaf_routes {
        let full_path = normalize_path(&format!("{}{}", current_path, leaf.path));
        routes.push(FlatRoute {
            full_path,
            method: leaf.method.clone(),
            section: current_path.clone(),
            breadcrumb: effective_breadcrumb.clone(),
        });
    }

    for child in &node.children {
        collect_flat_routes(child, &current_path, Some(&effective_breadcrumb), routes);
    }
}

fn normalize_path(path: &str) -> String {
    let normalized = path.replace("//", "/");
    if normalized.len() > 1 && normalized.ends_with('/') {
        normalized.trim_end_matches('/').to_string()
    } else {
        normalized
    }
}

fn colorize_method(method: &str) -> String {
    match method {
        "GET" => method.green().bold().to_string(),
        "POST" => method.yellow().bold().to_string(),
        "PUT" => method.blue().bold().to_string(),
        "DELETE" => method.red().bold().to_string(),
        "PATCH" => method.magenta().bold().to_string(),
        _ => method.to_string(),
    }
}

// ---------------------------------------------------------------------------
// Tree output
// ---------------------------------------------------------------------------

fn print_tree(root: &RouterNode, path_filter: Option<&str>, depth: usize, color: bool) {
    if depth == 0 {
        if color {
            println!("\n{}", "API Route Tree".bold().underline());
        } else {
            println!("\nAPI Route Tree");
        }
    }

    let indent = "  ".repeat(depth);
    let mount_display = if root.mount_path.is_empty() {
        "/".to_string()
    } else {
        root.mount_path.clone()
    };

    if color {
        println!("{}{}", indent, mount_display.bold());
    } else {
        println!("{}{}", indent, mount_display);
    }

    // Print leaf routes at this level
    for leaf in &root.leaf_routes {
        let full_display = if leaf.path.is_empty() || leaf.path == "/" {
            String::new()
        } else {
            leaf.path.clone()
        };

        let should_show = match path_filter {
            Some(filter) => full_display.contains(filter) || mount_display.contains(filter),
            None => true,
        };

        if should_show {
            if color {
                let colored_method = colorize_method(&leaf.method);
                println!("{}  {} {}", indent, colored_method, full_display);
            } else {
                println!("{}  {} {}", indent, leaf.method, full_display);
            }
        }
    }

    for child in &root.children {
        print_tree(child, path_filter, depth + 1, color);
    }
}
