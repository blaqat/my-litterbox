//   {
//     "name": "Rust Are We Secure Yet?",
//     "start": "Aug 2024",
//     "status": "Completed",
//     "end": "Dec 2024",
//     "description": "Researched on code vulnerabilities and how much the Rust language mitigates them by default to aid the writing of a related white paper. Categorized and analyzed CWEs based on Rust’s built-in protections.\nDeveloped a set of Python scripts and a Zola based static site to calculate, output, update, and finally display vulnerability metrics efficiently.",
//     "stack": ["Python", "PostgreSQL", "Zola", "Rust", "MongoDB"],
//     "type": "Work",
//     "github": "https://github.com/VulnerabilityHistoryProject/rust-are-we-secure-yet",
//     "view": "https://rust.vulnerabilityhistory.org/",
//     "images": [
//       {
//         "src": "https://media.licdn.com/dms/image/v2/D4E2DAQGWOsFb8EaRgA/profile-treasury-image-shrink_800_800/B4EZVm7JmIGwAc-/0/1741188538529?e=1758502800&v=beta&t=1WwZHH2UpIiK_20xw6PhtV2R7CoKODePODD1BJHz_SU",
//         "alt": "Rust Are We Secure Yet - Homepage"
//       }
//     ]
//   },
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
  return data as Project[];
}

export default { getProjectDuration, parseProjects };
