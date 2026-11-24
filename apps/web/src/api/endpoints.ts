import type {
  CreateInstructionInput,
  CreateProjectInput,
  CreateVersionInput,
  Dashboard,
  DiffResult,
  ExportRequest,
  ExportResult,
  InstructionDetail,
  InstructionListQuery,
  InstructionVersion,
  Project,
  ProjectInstruction,
  ProjectInstructionLinkInput,
  ProjectSummary,
  UpdateInstructionInput,
  UpdateProjectInput,
} from "@air/schema";
import { api, qs } from "./client";

export const endpoints = {
  dashboard: () => api<Dashboard>("GET", "/dashboard"),

  listInstructions: (q: InstructionListQuery) => api<InstructionDetail[]>("GET", `/instructions${qs({ ...q })}`),
  getInstruction: (id: string) => api<InstructionDetail>("GET", `/instructions/${id}`),
  createInstruction: (input: CreateInstructionInput) => api<InstructionDetail>("POST", "/instructions", input),
  updateInstruction: (id: string, input: UpdateInstructionInput) =>
    api<InstructionDetail>("PUT", `/instructions/${id}`, input),
  deleteInstruction: (id: string) => api<void>("DELETE", `/instructions/${id}`),

  listVersions: (id: string) => api<InstructionVersion[]>("GET", `/instructions/${id}/versions`),
  createVersion: (id: string, input: CreateVersionInput) =>
    api<InstructionVersion>("POST", `/instructions/${id}/versions`, input),
  diff: (id: string, from: string, to: string) =>
    api<DiffResult & { meta: string }>("GET", `/instructions/${id}/diff${qs({ from, to })}`),

  listProjects: () => api<ProjectSummary[]>("GET", "/projects"),
  getProject: (id: string) => api<Project>("GET", `/projects/${id}`),
  createProject: (input: CreateProjectInput) => api<Project>("POST", "/projects", input),
  updateProject: (id: string, input: UpdateProjectInput) => api<Project>("PUT", `/projects/${id}`, input),
  deleteProject: (id: string) => api<void>("DELETE", `/projects/${id}`),
  listProjectInstructions: (id: string) => api<ProjectInstruction[]>("GET", `/projects/${id}/instructions`),
  linkProjectInstruction: (id: string, input: ProjectInstructionLinkInput) =>
    api<ProjectInstruction[]>("POST", `/projects/${id}/instructions`, input),
  unlinkProjectInstruction: (id: string, instructionId: string) =>
    api<void>("DELETE", `/projects/${id}/instructions/${instructionId}`),

  exportFormats: () => api<Array<{ format: string; label: string }>>("GET", "/exports/formats"),
  export: (input: ExportRequest) => api<ExportResult>("POST", "/exports", input),
};
