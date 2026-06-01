import { useQuery } from "@tanstack/react-query";
import { getTechnologies } from "../api/technologies";

export function useTechnologiesList() {
    return useQuery({
        queryKey: ['technologiesList'],
        queryFn: getTechnologies
    });
}