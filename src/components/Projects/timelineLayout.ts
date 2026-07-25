import type { Project } from "./ProjectData";

export const COLLAPSED_ROW_HEIGHT = 44;
export const YEAR_HEADER_HEIGHT = 36;
export const ROW_GAP = 16;
export const YEAR_SECTION_GAP = 16;

export const FOCUS_BAND_TOP_RATIO = 0.35;
export const FOCUS_BAND_BOTTOM_RATIO = 0.55;
export const FOCUS_LINE_RATIO = 0.45;

export type TimelineEntry = {
  project: Project;
  year: number;
  isFirstInYear: boolean;
};

export function buildFlatEntries(
  groups: { [year: number]: Project[] },
  years: number[],
): TimelineEntry[] {
  const result: TimelineEntry[] = [];
  for (const year of years) {
    const projects = groups[year] ?? [];
    projects.forEach((project, index) => {
      result.push({ project, year, isFirstInYear: index === 0 });
    });
  }
  return result;
}
