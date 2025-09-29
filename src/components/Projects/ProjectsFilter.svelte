<script lang="ts">
  import { ProjectCategory } from "./ProjectData";

  let {
    selectedCategories = $bindable([
      ProjectCategory.Personal,
      ProjectCategory.Work,
      ProjectCategory.School,
    ]),
    onChange,
  }: {
    selectedCategories: ProjectCategory[];
    onChange?: (categories: ProjectCategory[]) => void;
  } = $props();

  const allCategories: ProjectCategory[] = [
    ProjectCategory.Personal,
    ProjectCategory.Work,
    ProjectCategory.School,
  ];

  function toggleCategory(cat: ProjectCategory) {
    if (selectedCategories.includes(cat)) {
      selectedCategories = selectedCategories.filter((c) => c !== cat);
    } else {
      selectedCategories = [...selectedCategories, cat];
    }
    onChange?.(selectedCategories);
  }
</script>

<div class="flex flex-wrap gap-2">
  {#each allCategories as cat}
    <button
      type="button"
      class="px-3 py-1 text-sm rounded-full border transition-all duration-200 font-medium focus:outline-none active:scale-95 hover:scale-105"
      class:bg-malibu-100={cat === ProjectCategory.Personal &&
        selectedCategories.includes(cat)}
      class:border-malibu-300={cat === ProjectCategory.Personal &&
        selectedCategories.includes(cat)}
      class:text-malibu-900={cat === ProjectCategory.Personal &&
        selectedCategories.includes(cat)}
      class:bg-harvest-gold-100={cat === ProjectCategory.Work &&
        selectedCategories.includes(cat)}
      class:border-harvest-gold-300={cat === ProjectCategory.Work &&
        selectedCategories.includes(cat)}
      class:text-harvest-gold-900={cat === ProjectCategory.Work &&
        selectedCategories.includes(cat)}
      class:bg-orange-100={cat === ProjectCategory.School &&
        selectedCategories.includes(cat)}
      class:border-orange-300={cat === ProjectCategory.School &&
        selectedCategories.includes(cat)}
      class:text-orange-900={cat === ProjectCategory.School &&
        selectedCategories.includes(cat)}
      class:bg-gray-50={!selectedCategories.includes(cat)}
      class:border-gray-200={!selectedCategories.includes(cat)}
      class:text-gray-600={!selectedCategories.includes(cat)}
      class:hover:line-through={selectedCategories.includes(cat)}
      class:opacity-70={!selectedCategories.includes(cat)}
      class:shadow-sm={selectedCategories.includes(cat)}
      onclick={() => toggleCategory(cat)}>{cat}</button
    >
  {/each}
</div>
