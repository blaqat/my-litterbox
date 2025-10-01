export enum ProjectCategory {
  Personal = "Personal",
  Work = "Work",
  School = "School",
}

export enum ProjectState {
  Ongoing = "Ongoing",
  Completed = "Completed",
  Paused = "Paused",
}

export type ProjectImage = {
  src: string;
  alt: string;
};

type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

/** Project date in "Mon YYYY" format
 * @example "Jan 2023"
 */
export type ProjectDate = `${Month} 20${number}${number}`;
export type ProjectDateRange =
  | `${ProjectDate} - ${ProjectDate}`
  | `${ProjectDate} - `;

// Represents a code project
export type Project = {
  slug: string;
  name: string;
  start: ProjectDate;
  status: ProjectState;
  end?: ProjectDate;
  description: string;
  stack: string[];
  type: ProjectCategory;
  github?: string;
  view?: string;
  images: ProjectImage[];
};

/**
 * Converts an arbitrary string into a URL-friendly slug.
 * @example "Hello World!" becomes "hello-world".
 * @param name - The input string to convert into a slug.
 * @returns A lowercase, hyphen-separated slug suitable for use in URLs or identifiers.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Parses a project date string in "Month Year" format and converts it to a Date object.
 *
 * @param date - A string representing a project date in the format "Month Year"
 * @example "Jan 2023"
 * @returns A Date object set to the first day of the specified month and year
 */
export function parseProjectDate(date: ProjectDate): Date {
  const [month, year] = date.split(" ");
  return new Date(`${month} 1, ${year}`);
}

/**
 * Sorts and groups an array of projects by year.
 *
 * The function performs two operations:
 * 1. Sorts the provided `projects` array in-place in descending chronological order
 * 2. Reduces the sorted list into an object of year keys mapping to arrays of projects
 *
 * @param projects - The array of projects to sort and group.
 * @returns Object of [year]: Project[] mappings
 */
export function getSortedProjects(projects: Project[]): {
  [year: number]: Project[];
} {
  // Sorts projects in-place by most recent date (start or end)
  const sorted = projects.sort((a, b) => {
    const aDate =
      a.status === ProjectState.Completed
        ? parseProjectDate(a.end!)
        : parseProjectDate(a.start);
    const bDate =
      b.status === ProjectState.Completed
        ? parseProjectDate(b.end!)
        : parseProjectDate(b.start);
    return bDate.getTime() - aDate.getTime();
  });

  // Groups projects by year
  return sorted.reduce((acc, project) => {
    const year =
      project.status === ProjectState.Completed
        ? parseInt(project.end!.split(" ")[1])
        : parseInt(project.start.split(" ")[1]);
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {} as { [year: number]: Project[] });
}

/**
 * Returns a human-readable date range for a project.
 * Will return an open-ended range if the project is ongoing or paused.
 *
 * @example "Aug 2022 - Dec 2022" or "Jan 2023 - "
 * @param project - The project for which to produce the date range.
 * @returns The project's date range as a ProjectDateRange string.
 */
export function getProjectDuration(project: Project): ProjectDateRange {
  if (project.status !== ProjectState.Completed) {
    return `${project.start} - `;
  } else if (!project.end) {
    throw new Error("Completed project must have an end date");
  } else {
    return `${project.start} - ${project.end}`;
  }
}

/**
 * Parse a JSON string into an array of Project objects and assign slugs if missing.
 *
 * @param json - A JSON string representing an array of projects
 * @returns An array of `Project` objects where every item is guaranteed to have a `slug` property.
 */
export function parseProjects(json: string): Project[] {
  const data = JSON.parse(json);
  return (data as Omit<Project, "slug">[] & Partial<Project>[]).map(
    (p: any) => ({
      ...p,
      slug: p.slug ?? slugify(p.name),
    })
  );
}

/**
 * Determines whether a project's searchable fields contain the provided search string.
 *
 * @param project - The project to test.
 * @param search - The query string to match against the project's searchable text.
 * @returns `true` if the project matches the search string, `false` otherwise.
 */
export function projectMatches(project: Project, search: string): boolean {
  const h = search.toLowerCase();

  // Create a single string of all searchable fields
  const projectString = [
    project.name,
    project.description,
    project.type,
    project.status,
    getProjectDuration(project),
    ...project.stack,
  ]
    .join(" ")
    .toLowerCase();

  // Check if search string is included in combined project string
  return projectString.includes(h);
}

export default { getProjectDuration, parseProjects };
