<script lang="ts">
  import { onMount } from "svelte";
  import { CursorClick } from "phosphor-svelte";

  let {
    hintKey,
    onDismiss,
    class: className = "",
    cursorClass = "",
    dismiss = false,
  }: {
    hintKey: string;
    onDismiss?: () => void;
    class?: string;
    cursorClass?: string;
    dismiss?: boolean;
  } = $props();

  let shouldShow = $state(false);
  let mounted = $state(false);

  // If already dismissed, stops from being shown again.
  onMount(() => {
    mounted = true;
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(`hint-dismissed-${hintKey}`);
      shouldShow = !dismissed;
    }
  });

  // Watch for external dismiss signal
  $effect(() => {
    if (dismiss && mounted) {
      dismissHint();
    }
  });

  // Stores the hint as dismissed in localStorage and hides it
  function dismissHint() {
    if (typeof window !== "undefined") {
      localStorage.setItem(`hint-dismissed-${hintKey}`, "true");
    }
    shouldShow = false;
    onDismiss?.();
  }
</script>

{#if mounted && shouldShow}
  <button
    class="absolute -top-5 -right-2 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform z-10"
    onclick={dismissHint}
    aria-label="Click to dismiss hint"
    title="Click to dismiss this hint"
  >
    <span
      class="flex items-center gap-1 text-xs font-semibold text-black bg-white border-2 px-3 py-1 rounded-full shadow-sm whitespace-nowrap mt-1 {className}"
    >
      click to open!
      <CursorClick
        size={12}
        class="inline-block ml-1 {cursorClass}"
        weight="duotone"
      />
    </span>
  </button>
{/if}
