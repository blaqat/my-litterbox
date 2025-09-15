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
export type ProjectDate = `${Month} 20${number}${number}`;
type ProjectDateRange = `${ProjectDate} - ${ProjectDate}` | `${ProjectDate} - `;

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

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseProjectDate(date: ProjectDate): Date {
  const [month, year] = date.split(" ");
  return new Date(`${month} 1, ${year}`);
}

export function getSortedProjects(projects: Project[]): {
  [year: number]: Project[];
} {
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

export function getProjectDuration(project: Project): ProjectDateRange {
  if (project.status !== ProjectState.Completed) {
    return `${project.start} - `;
  } else if (!project.end) {
    throw new Error("Completed project must have an end date");
  } else {
    return `${project.start} - ${project.end}`;
  }
}

export function parseProjects(json: string): Project[] {
  const data = JSON.parse(json);
  return (data as Omit<Project, "slug">[] & Partial<Project>[]).map(
    (p: any) => ({
      ...p,
      slug: p.slug ?? slugify(p.name),
    })
  );
}

export function projectMatches(project: Project, search: string): boolean {
  const h = search.toLowerCase();
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

  return projectString.includes(h);
}

export default { getProjectDuration, parseProjects };
