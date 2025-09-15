import { writable } from "svelte/store";
import type { Project } from "./ProjectData";

export const activeProject = writable<Project | null>(null);

export function openProject(project: Project) {
  activeProject.set(project);
}

export function closeProject() {
  activeProject.set(null);
}

export default { activeProject, openProject, closeProject };
