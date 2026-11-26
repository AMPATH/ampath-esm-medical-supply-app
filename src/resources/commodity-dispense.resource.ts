import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

/**
 * Dispensing against an order goes through orderexpansion's /commoditydispense resource. Each save
 * or void there also moves the order's fulfiller status, so the app never sets COMPLETED itself.
 */
export type DispenseStatus = 'PENDING' | 'COMPLETED' | 'DECLINED';

export interface CommodityDispense {
  uuid: string;
  status: DispenseStatus;
  quantity: number | null;
  quantityUnits?: { uuid: string; display: string } | null;
  billReference?: string | null;
  dateDispensed?: string | null;
  comment?: string | null;
  voided: boolean;
}

export interface NewDispense {
  order: string;
  status: DispenseStatus;
  quantity?: number;
  quantityUnits?: string;
  statusReason?: string;
  dispenser: string;
  location: string;
  comment?: string;
}

const dispenseUrl = `${restBaseUrl}/commoditydispense`;
const representation =
  'custom:(uuid,status,quantity,quantityUnits:(uuid,display),billReference,dateDispensed,comment,voided)';

export function useOrderDispenses(orderUuid: string | undefined) {
  const url = orderUuid ? `${dispenseUrl}?order=${orderUuid}&v=${representation}` : null;
  const { data, error, isLoading, mutate: mutateDispenses } = useSWR<{ data: { results: Array<CommodityDispense> } }>(
    url,
    openmrsFetch,
  );
  const dispenses = (data?.data?.results ?? []).filter((dispense) => !dispense.voided);
  return { dispenses, error, isLoading, mutate: mutateDispenses };
}

export function useInvalidateOrderDispenses() {
  return useCallback(() => {
    mutate((key) => typeof key === 'string' && key.startsWith(`${dispenseUrl}?order=`), undefined, {
      revalidate: true,
    });
  }, []);
}

export function createDispense(dispense: NewDispense, abortController?: AbortController) {
  return openmrsFetch<CommodityDispense>(dispenseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: dispense,
    signal: abortController?.signal,
  });
}

export function updateDispense(
  uuid: string,
  changes: Partial<Pick<NewDispense, 'status' | 'comment'>> & { billReference?: string },
  abortController?: AbortController,
) {
  return openmrsFetch<CommodityDispense>(`${dispenseUrl}/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: changes,
    signal: abortController?.signal,
  });
}

export function voidDispense(uuid: string, reason: string, abortController?: AbortController) {
  return openmrsFetch(`${dispenseUrl}/${uuid}?reason=${encodeURIComponent(reason)}`, {
    method: 'DELETE',
    signal: abortController?.signal,
  });
}

/**
 * The most useful message from a failed request. Dispense rule violations come back as 400 with the
 * reason in globalErrors; field validation errors come back in fieldErrors.
 */
export function dispenseErrorMessage(error: unknown): string {
  const restError = (error as { responseBody?: { error?: RestError } })?.responseBody?.error;
  const globalError = restError?.globalErrors?.[0]?.message;
  const fieldError = Object.values(restError?.fieldErrors ?? {})[0]?.[0]?.message;
  return globalError || fieldError || restError?.message || (error as Error)?.message || String(error);
}

interface RestError {
  message?: string;
  globalErrors?: Array<{ message: string }>;
  fieldErrors?: Record<string, Array<{ message: string }>>;
}
