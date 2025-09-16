<script lang="ts">
  import { Cloud, BracketsCurly, Code, Cpu, Brain } from "phosphor-svelte";

  export let name: string;

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

  function iconUrl(label: string): string | null {
    const key = Object.keys(devicons).find(
      (k) => k.toLowerCase() === label.toLowerCase()
    );
    if (!key) return null;
    const slug = devicons[key];
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
  }

  $: url = iconUrl(name);
</script>

<span class="tag">
  {#if url}
    <img class="icon" src={url} alt={name + " icon"} loading="lazy" />
  {:else}
    <BracketsCurly size={14} class="icon-fallback" />
  {/if}
  <span class="whitespace-nowrap">{name}</span>
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 9999px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
  }
  .icon {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }
</style>
