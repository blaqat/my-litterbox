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

/**
 * Closes the currently active project and updates the browser history.
 *
 * @param opts - Configuration options for closing the project
 * @param opts.fromPopState - If true, skips updating browser history to prevent infinite loops when called from popstate events
 */
export function closeProject(opts: { fromPopState?: boolean } = {}) {
  activeProject.set(null);
  if (typeof window !== "undefined" && !opts.fromPopState) {
    window.history.pushState({}, "", PROJECTS_BASE);
  }
}

// Listen for popstate events to handle back/forward navigation
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

/**
 * Initializes the projects store with the provided projects array and handles route-based project navigation.
 *
 * This function sets up the global projects state and checks if the current URL path corresponds to a specific
 * project route. If a matching project is found based on the URL slug, it automatically opens that project.
 *
 * @param projects - Array of Project objects to initialize the store with
 */
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
