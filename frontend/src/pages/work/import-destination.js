export function applyImportDestination(plan, target, projects) {
  const project = projects.find((p) => p.id === target);
  if (!project)
    return {
      ...plan,
      projects: plan.projects.map((p) => ({ ...p, target: "" })),
    };
  return {
    ...plan,
    projects: [
      {
        name: project.name,
        target: project.id,
        tasks: plan.projects.flatMap((p) => p.tasks),
      },
    ],
  };
}
