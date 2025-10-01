/**
 * Screensize utility for breakpoints based on Tailwind CSS.
 * - sm: 640px and up
 * - md: 768px and up
 * - lg: 1024px and up
 * - xl: 1280px and up
 * - two_xl: 1536px and up
 *
 * Also includes greater-than and less-than utilities:
 * - gt_* (greater than): Matches the next breakpoint up
 * - lt_* (less than): Matches below the specified breakpoint
 */

import { MediaQuery } from "svelte/reactivity";

const smM = new MediaQuery("min-width: 640px", false);
const mdM = new MediaQuery("min-width: 768px", false);
const lgM = new MediaQuery("min-width: 1024px", false);
const xlM = new MediaQuery("min-width: 1280px", false);
const x2M = new MediaQuery("min-width: 1536px", false);

export const Device = {
  get sm() {
    return smM.current;
  },
  get md() {
    return mdM.current;
  },
  get lg() {
    return lgM.current;
  },
  get xl() {
    return xlM.current;
  },
  get two_xl() {
    return x2M.current;
  },

  get gt_sm() {
    return mdM.current;
  },
  get gt_md() {
    return lgM.current;
  },
  get gt_lg() {
    return xlM.current;
  },
  get gt_xl() {
    return x2M.current;
  },

  get lt_md() {
    return !mdM.current;
  },
  get lt_lg() {
    return !lgM.current;
  },
  get lt_xl() {
    return !xlM.current;
  },
  get lt_2xl() {
    return !x2M.current;
  },
};
