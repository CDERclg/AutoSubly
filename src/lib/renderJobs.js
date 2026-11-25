const jobs = globalThis.__autosublyRenderJobs ?? new Map();

globalThis.__autosublyRenderJobs = jobs;

export default jobs;