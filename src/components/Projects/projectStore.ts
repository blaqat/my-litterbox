import { writable } from "svelte/store";
import type { Project } from "./ProjectData";

const PROJECTS_BASE = "/projects";

let _projects: Project[] = [];

export const activeProject = writable<Project | null>(null);

export function openProject(
  project: Project,
  opts: { replace?: boolean } = {}
) {
  activeProject.set(project);
  if (typeof window !== "undefined") {
    const url = `${PROJECTS_BASE}/${encodeURIComponent(project.slug)}`;
    if (opts.replace) {
      window.history.replaceState({ project: project.slug }, "", url);
    } else {
      window.history.pushState({ project: project.slug }, "", url);
    }
  }
}

export function closeProject(opts: { fromPopState?: boolean } = {}) {
  activeProject.set(null);
  if (typeof window !== "undefined" && !opts.fromPopState) {
    window.history.pushState({}, "", PROJECTS_BASE);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (path.startsWith(`${PROJECTS_BASE}/`)) {
      const slug = decodeURIComponent(path.substring(PROJECTS_BASE.length + 1));
      const found = _projects.find((p) => p.slug === slug);
      if (found) {
        openProject(found, { replace: true });
      }
    } else if (path === PROJECTS_BASE) {
      closeProject({ fromPopState: true });
    }
  });
}

export function initializeProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  _projects = projects;
  const path = window.location.pathname;
  if (path.startsWith(`${PROJECTS_BASE}/`)) {
    const slug = decodeURIComponent(path.substring(PROJECTS_BASE.length + 1));
    const found = projects.find((p) => p.slug === slug);
    if (found) {
      openProject(found, { replace: true });
    }
  }
}

export default { activeProject, openProject, closeProject };
