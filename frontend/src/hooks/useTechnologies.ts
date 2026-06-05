import { useQuery, useMutation } from "@tanstack/react-query";
import { getTechnologies } from "../api/technologies";
import { ingestDocument } from "../api/documentLoaders";

export function useTechnologiesList() {
    return useQuery({
        queryKey: ['technologiesList'],
        queryFn: getTechnologies
    });
}

export function useAddTechnology() {
    return useMutation({
        mutationKey: ['addTechnology'],
        mutationFn: ingestDocument
    });
}