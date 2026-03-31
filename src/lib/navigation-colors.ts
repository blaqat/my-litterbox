import { Envelope, Folder, MusicNotes, Cloud } from "phosphor-svelte";

export type NavigationItem = {
  href: string;
  label: string;
  color: string;
  hover: string;
  icon?: any;
  fill: string;
  text: string;
};

export const navigationItems: NavigationItem[] = [
  // {
  //   href: "/contact",
  //   label: "Contact",
  //   color: "bg-sea-pink-400",
  //   hover: "hover:bg-sea-pink-300",
  //   text: "text-sea-pink-900",
  //   fill: "fill-sea-pink-500",
  //   icon: Envelope,
  // },
  {
    href: "/projects",
    label: "Projects",
    color: "bg-malibu-400",
    hover: "hover:bg-malibu-300",
    text: "text-malibu-900",
    fill: "fill-malibu-500",
    icon: Folder,
  },
  {
    href: "/music",
    label: "Music",
    color: "bg-light-wisteria-400",
    hover: "hover:bg-light-wisteria-300",
    fill: "fill-light-wisteria-500",
    text: "text-light-wisteria-900",
    icon: MusicNotes,
  },
  // {
  //   href: "/thoughts",
  //   label: "Thoughts",
  //   color: "bg-harvest-gold-300",
  //   hover: "hover:bg-harvest-gold-200",
  //   text: "text-harvest-gold-900",
  //   fill: "fill-harvest-gold-500",
  //   icon: Cloud,
  // },
];

export default navigationItems;
