export function syncTaskCompletion(tasks, result, previous, projects = []) {
  const ids = new Set();
  if (
    JSON.stringify(previous?.checklist || []) !==
    JSON.stringify(result.checklist || [])
  )
    ids.add(result.id);
  if (result.parent) ids.add(result.parent);
  if (previous?.parent && previous.parent !== result.parent)
    ids.add(previous.parent);
  return tasks.map((t) => {
    if (!ids.has(t.id) || t.deleted || t.archived) return t;
    const children = tasks.filter(
      (c) => c.parent === t.id && !c.deleted && !c.archived,
    );
    const checks = t.checklist || [];
    if (!children.length && !checks.length) return t;
    const complete =
      children.every((c) => c.status === "done") && checks.every((c) => c.done);
    if (complete && t.status !== "done")
      return {
        ...t,
        status: "done",
        previousStatus: t.status,
        revision: t.revision + 1,
      };
    if (!complete && t.status === "done")
      return {
        ...t,
        status:
          projects
            .find((p) => p.id === t.project)
            ?.columns.find((c) => c.id === t.previousStatus)?.id ||
          projects.find((p) => p.id === t.project)?.columns[0]?.id ||
          "inbox",
        revision: t.revision + 1,
      };
    return t;
  });
}
