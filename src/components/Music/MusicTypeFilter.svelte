<script lang="ts">
  import { MusicInstrument } from "./types";
  import { PianoKeys, Circle, WaveSine } from "phosphor-svelte";

  let {
    selectedInstruments = $bindable([
      MusicInstrument.Piano,
      MusicInstrument.Beepbox,
      MusicInstrument.DAW,
    ]),
    onChange,
  }: {
    selectedInstruments: MusicInstrument[];
    onChange?: (instruments: MusicInstrument[]) => void;
  } = $props();

  const instrumentOptions = [
    {
      type: MusicInstrument.Piano,
      label: "Piano",
      activeColor: "bg-malibu-100 text-malibu-900 border-malibu-300",
      inactiveColor:
        "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
    },
    {
      type: MusicInstrument.Beepbox,
      label: "BeepBox",
      activeColor:
        "bg-light-wisteria-100 text-light-wisteria-900 border-light-wisteria-300",
      inactiveColor:
        "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
    },
    {
      type: MusicInstrument.DAW,
      label: "DAW",
      activeColor: "bg-sea-pink-100 text-sea-pink-900 border-sea-pink-300",
      inactiveColor:
        "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
    },
  ];

  // If instrument is selected, remove it; if not, add it
  function toggleInstrument(instrument: MusicInstrument) {
    if (selectedInstruments.includes(instrument)) {
      selectedInstruments = selectedInstruments.filter((i) => i !== instrument);
    } else {
      selectedInstruments = [...selectedInstruments, instrument];
    }
    onChange?.(selectedInstruments);
  }
</script>

<div class="flex flex-wrap gap-2">
  {#each instrumentOptions as option}
    <button
      class=" hover:scale-105 active:scale-95 px-3 py-1 text-sm rounded-full border transition-all duration-200 {selectedInstruments.includes(
        option.type
      )
        ? option.activeColor + ' shadow-sm'
        : option.inactiveColor}"
      class:hover:line-through={selectedInstruments.includes(option.type)}
      onclick={() => toggleInstrument(option.type)}
    >
      <div class="flex items-center gap-1.5">
        {#if option.type === MusicInstrument.Piano}
          <PianoKeys size={14} weight="bold" />
        {:else if option.type === MusicInstrument.Beepbox}
          <Circle size={14} weight="bold" />
        {:else if option.type === MusicInstrument.DAW}
          <WaveSine size={14} weight="bold" />
        {/if}
        <span>{option.label}</span>
      </div>
    </button>
  {/each}
</div>
