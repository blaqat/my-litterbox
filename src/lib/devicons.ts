// Map of technology names to devicon slugs
const devicons: Record<string, string> = {
  Astro: "astro",
  Svelte: "svelte",
  Tailwind: "tailwindcss",
  Cloudflare: "cloudflare",
  Python: "python",
  PostgreSQL: "postgresql",
  Rust: "rust",
  MongoDB: "mongodb",
  Flask: "flask",
  React: "react",
  Azure: "azure",
  Sqlite3: "sqlite",
  Java: "java",
  JavaScript: "javascript",
  Typescript: "typescript",
  Deno: "denojs",
  Node: "nodejs",
  "Node.js": "nodejs",
  "Discord.py": "discordjs",
  "Discord.js": "discordjs",
  "Google Sheets API": "google",
  C: "c",
  "Next.js": "nextjs",
  Supabase: "supabase",
};

/**
 * Retrieves the URL for a DevIcon based on the provided label.
 *
 * @param label - The name/label of the technology or framework to get the icon for
 * @returns The URL for the DevIcon SVG, or null if no matching icon is found
 */
export function getIconUrl(label: string): string | null {
  const key = Object.keys(devicons).find(
    (k) => k.toLowerCase() === label.toLowerCase()
  );
  if (!key) return null;
  const slug = devicons[key];
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

export default { getIconUrl };
