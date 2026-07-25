import Prism from "prismjs";
import "prismjs/components/prism-rust";
import "prism-themes/themes/prism-vs.css";

/**
 * Runs Prism syntax highlighting on all fenced code blocks under the given
 * root element. Shared by ProjectCard (grid + expanded timeline cards) and
 * ProjectModal so code blocks are readable as soon as they render, without
 * waiting for the modal to open.
 */
export function highlightCodeBlocks(root: Element | Document = document) {
  Prism.highlightAllUnder(root);
}
