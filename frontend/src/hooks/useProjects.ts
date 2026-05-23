import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjects, createProject } from "../api/projects";

export function useProjectsList() {
    return useQuery({
        queryKey: ['projectsList'],
        queryFn: getProjects
    });
}

export function useCreateProject() {
    return useMutation({
        mutationKey: ['createProject'],
        mutationFn: createProject
    });
}