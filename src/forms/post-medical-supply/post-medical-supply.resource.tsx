import useSWR from "swr";
import {
  type OpenmrsResource,
  openmrsFetch,
  restBaseUrl,
  useConfig,
} from "@openmrs/esm-framework";
import { type CodedProvider, type CodedCondition } from "../../types";

type Provider = {
  uuid: string;
  display: string;
  person: OpenmrsResource;
};

export const useProviders = () => {
  const url = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))`;
  const { data, error, isLoading } = useSWR<{
    data: { results: Array<Provider> };
  }>(url, openmrsFetch);

  return {
    providers: data?.data.results ?? [],
    isLoadingProviders: isLoading,
    loadingProvidersError: error,
  };
};

export const savePostMedicalSupply = async (postMedicalSupply: object) => {
  const response = await openmrsFetch(`${restBaseUrl}/medical-supply`, {
    method: "POST",
    body: JSON.stringify(postMedicalSupply),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;
  const conditionsSearchUrl = `${restBaseUrl}/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${conditionToLookup}`;
  const { data, error, isLoading } = useSWR<
    { data: { results: Array<CodedCondition> } },
    Error
  >(conditionToLookup ? conditionsSearchUrl : null, openmrsFetch);

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

export function useProvidersSearch(providerToLookup: string) {
  const providerSearchUrl = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))&q=${providerToLookup}`;
  const { data, error, isLoading } = useSWR<
    { data: { results: Array<CodedProvider> } },
    Error
  >(providerToLookup ? providerSearchUrl : null, openmrsFetch);

  return {
    providerSearchResults: data?.data?.results ?? [],
    error: error,
    isProviderSearching: isLoading,
  };
}

export async function updateOrder(uuid: string, body: any) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/order/${uuid}/fulfillerdetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: body,
  });
}
