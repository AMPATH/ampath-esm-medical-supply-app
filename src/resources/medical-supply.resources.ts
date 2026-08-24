import { useSession, useConfig, restBaseUrl, openmrsFetch, type Order, useAppContext } from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR, { mutate } from 'swr';
import { type Config } from "../config-schema";
import { useCallback, useEffect, useState } from "react";
import { type QueueEntryResult, type DateFilterContext } from "../types";
import { getEtlBaseUrl } from "../utils/utils";

export function useMedicalSupplyOrders(status: string) {
  const { dateRange } = useAppContext<DateFilterContext>('medical-supply-date-filter') ?? {
    dateRange: [dayjs().startOf('day').toDate(), new Date()],
  };
  const { sessionLocation } = useSession();

  const { medicalSupplyOrderTypeUuid } = useConfig<Config>();
  const customRepresentation = `custom:(uuid,orderNumber,patient:(uuid,display,person:(uuid,display,age,birthdate,gender,attributes),identifiers),concept:(uuid,display),action,careSetting:(uuid,display,description,careSettingType,display),previousOrder,dateActivated,scheduledDate,dateStopped,autoExpireDate,encounter:(uuid,display,location:(uuid)),orderer:(uuid,display),orderReason,orderReasonNonCoded,orderType:(uuid,display,name,description,conceptClasses,parent),urgency,instructions,commentToFulfiller,display,fulfillerStatus,fulfillerComment,accessionNumber)`;
  let url = `${restBaseUrl}/order?orderTypes=${medicalSupplyOrderTypeUuid}&v=${customRepresentation}`;
  url = `${url}&fulfillerStatus=${status}`;
  url = `${url}&excludeCanceledAndExpired=true&excludeDiscontinueOrders=true`;
  url = dateRange
    ? `${url}&activatedOnOrAfterDate=${dateRange.at(0).toISOString()}&activatedOnOrBeforeDate=${dateRange
      .at(1)
      .toISOString()}`
    : url;

  const { data, error, isLoading, isValidating } = useSWR<{
    data: { results: Array<Order> };
  }>(`${url}`, openmrsFetch);

  let filteredOrders = data?.data?.results?.filter((order) => order.encounter?.location?.uuid === sessionLocation?.uuid);

  if (status === "" && filteredOrders) {
    filteredOrders = filteredOrders.filter(v => v.fulfillerStatus === null);
  }

  return {
    orders: filteredOrders ?? [],
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useQueueEntries(patientUuid: string = '') {
  const [etlBaseUrl, setEtlBaseUrl] = useState('');
  const { sessionLocation } = useSession();
  const { serviceUuid } = useConfig<Config>();

  useEffect(() => {
    const fetchEtlBaseUrl = async () => {
      const baseUrl = await getEtlBaseUrl();
      setEtlBaseUrl(baseUrl);
    };
    fetchEtlBaseUrl();
  }, []);

  const url = `${etlBaseUrl}/queue-entry?locationUuid=${sessionLocation?.uuid}&serviceUuid=${serviceUuid}`;
  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: { data: Array<QueueEntryResult> };
  }>(etlBaseUrl ? `${url}` : null, openmrsFetch);

  let filteredQueueEntries = data?.data?.data;

  if (patientUuid) {
    filteredQueueEntries = filteredQueueEntries?.filter((queueEntry) => queueEntry.patient_uuid === patientUuid);
  }

  return {
    queueEntries: filteredQueueEntries ?? [],
    isLoading,
    isError: error,
    mutate,
    isValidating,
  };
}

export function setFulfillerStatus(orderId: string, status: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/order/${orderId}/fulfillerdetails/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: { fulfillerStatus: status },
  });
}

export function rejectMedicalSupplyOrder(orderId: string, comment: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/order/${orderId}/fulfillerdetails/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      fulfillerStatus: 'DECLINED',
      fulfillerComment: comment,
    },
  });
}

export function useInvalidateMedicalSupplyOrders() {
  const { medicalSupplyOrderTypeUuid } = useConfig<Config>();

  return useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?orderTypes=${medicalSupplyOrderTypeUuid}`),
      undefined,
      { revalidate: true },
    );
  }, [medicalSupplyOrderTypeUuid]);
}