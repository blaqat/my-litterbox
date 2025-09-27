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

export function getIconUrl(label: string): string | null {
  const key = Object.keys(devicons).find(
    (k) => k.toLowerCase() === label.toLowerCase()
  );
  if (!key) return null;
  const slug = devicons[key];
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

export default { getIconUrl };
