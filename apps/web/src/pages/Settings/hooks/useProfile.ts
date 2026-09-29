import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api.ts";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: api.profile });
}
