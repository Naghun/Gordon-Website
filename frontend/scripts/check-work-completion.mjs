import assert from "node:assert/strict";
import { syncTaskCompletion } from "../src/pages/work/task-completion.js";
const projects = [{ id: 1, columns: [{ id: "ideas" }] }];
const parent = {
  id: 1,
  project: 1,
  status: "ideas",
  revision: 1,
  checklist: [{ id: "a", done: false }],
};
const child = {
  id: 2,
  parent: 1,
  project: 1,
  status: "ideas",
  revision: 1,
  checklist: [],
};
const doneChild = { ...child, status: "done" };
let result = syncTaskCompletion(
  [parent, doneChild],
  doneChild,
  child,
  projects,
);
assert.equal(
  result[0].status,
  "ideas",
  "Incomplete checklist keeps parent active",
);
const checked = { ...parent, checklist: [{ id: "a", done: true }] };
result = syncTaskCompletion([checked, doneChild], checked, parent, projects);
assert.equal(result[0].status, "done");
const reopened = syncTaskCompletion(
  [result[0], child],
  child,
  doneChild,
  projects,
);
assert.equal(reopened[0].status, "ideas");
const unrelated = { ...parent, id: 3 };
assert.equal(
  syncTaskCompletion([unrelated, child], child, doneChild, projects)[0],
  unrelated,
);
console.log(
  "Work completion: combined checklist/children, automatic completion, reopening and unrelated tasks passed.",
);
