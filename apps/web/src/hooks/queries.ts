import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InstructionListQuery } from "@air/schema";
import { endpoints } from "../api/endpoints";

export const keys = {
  dashboard: ["dashboard"] as const,
  instructions: (q?: InstructionListQuery) => (q ? (["instructions", "list", q] as const) : (["instructions"] as const)),
  instruction: (id: string) => ["instructions", "detail", id] as const,
  versions: (id: string) => ["instructions", "versions", id] as const,
  diff: (id: string, from: string, to: string) => ["instructions", "diff", id, from, to] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", "detail", id] as const,
  projectInstructions: (id: string) => ["projects", "instructions", id] as const,
};

export const useDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: endpoints.dashboard });

export const useInstructions = (q: InstructionListQuery = {}) =>
  useQuery({ queryKey: keys.instructions(q), queryFn: () => endpoints.listInstructions(q) });

export const useInstruction = (id: string) =>
  useQuery({ queryKey: keys.instruction(id), queryFn: () => endpoints.getInstruction(id) });

export const useVersions = (id: string) =>
  useQuery({ queryKey: keys.versions(id), queryFn: () => endpoints.listVersions(id) });

export const useDiff = (id: string, from: string | null, to: string | null) =>
  useQuery({
    queryKey: keys.diff(id, from ?? "", to ?? ""),
    queryFn: () => endpoints.diff(id, from!, to!),
    enabled: Boolean(from && to),
  });

export const useProjects = () => useQuery({ queryKey: keys.projects, queryFn: endpoints.listProjects });

export const useProject = (id: string) => useQuery({ queryKey: keys.project(id), queryFn: () => endpoints.getProject(id) });

export const useProjectInstructions = (id: string) =>
  useQuery({ queryKey: keys.projectInstructions(id), queryFn: () => endpoints.listProjectInstructions(id) });

/** 変更系の後は関連キャッシュをまとめて無効化する (個人用なので粒度は粗くてよい) */
export function useInvalidatingMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["instructions"] }),
        qc.invalidateQueries({ queryKey: ["projects"] }),
        qc.invalidateQueries({ queryKey: keys.dashboard }),
      ]);
    },
  });
}
