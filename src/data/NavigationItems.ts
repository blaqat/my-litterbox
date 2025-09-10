
export type NavigationItem = {
  href: string;
  label: string;
  color: string;
  hover: string;
  text: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/contact",
    label: "Contact",
    color: "bg-sea-pink-400",
    hover: "hover:bg-sea-pink-300",
    text: "text-sea-pink-900",
  },
  {
    href: "/projects",
    label: "Projects",
    color: "bg-malibu-400",
    hover: "hover:bg-malibu-300",
    text: "text-malibu-900",
  },
  {
    href: "/music",
    label: "Music",
    color: "bg-light-wisteria-400",
    hover: "hover:bg-light-wisteria-300",
    text: "text-light-wisteria-900",
  },
  {
    href: "/thoughts",
    label: "Thoughts",
    color: "bg-harvest-gold-300",
    hover: "hover:bg-harvest-gold-200",
    text: "text-harvest-gold-900",
  },
];

export default navigationItems;