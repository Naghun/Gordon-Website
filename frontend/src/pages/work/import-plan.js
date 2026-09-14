export function manualPlan(source) {
  const projects = [];
  let project = null,
    task = null,
    gap = false;
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      gap = true;
      continue;
    }
    if (/^#\s|^projekat\s*:/i.test(line)) {
      project = {
        name: line.replace(/^#\s*|^projekat\s*:\s*/i, "").slice(0, 100),
        tasks: [],
      };
      projects.push(project);
      task = null;
      gap = false;
      continue;
    }
    if (!project) {
      project = { name: "Uvezeni zadaci", tasks: [] };
      projects.push(project);
    }
    const item = {
      title: line.replace(/^[-*•]\s*|^\d+[.)]\s*/, "").slice(0, 180),
      description: "",
      due: "",
    };
    if (!task || gap) {
      task = { ...item, subtasks: [] };
      project.tasks.push(task);
    } else task.subtasks.push(item);
    gap = false;
  }
  return { projects: projects.filter((p) => p.tasks.length) };
}
