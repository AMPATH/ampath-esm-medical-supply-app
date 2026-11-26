import { useConfig } from '@openmrs/esm-framework';
import { useCallback, useMemo } from 'react';
import { type Config } from '../config-schema';
import { type BillInvoice, type BillStatus, type LineItem, type Order } from '../types';
import { useInvalidateBills, useInvalidateOrderBill, useOdooBills, useOrderBill } from './bill.resource';
import { type OrderBillResponse, type PreauthRequest } from './bill.types';

interface BillStatusInputs {
  orderBill?: OrderBillResponse;
  bills?: Array<BillInvoice>;
  preauthRequests?: Array<PreauthRequest>;
  blockedPaymentModes: Array<string>;
}

/**
 * The status of the bill line linked to an order, using the same rules as the laboratory app:
 * prepaid modes (a bill line priced under one of blockedPaymentModes, e.g. MPESA or CASH) report the
 * line's real payment status; SHA lines go through the claim visit and pre-authorization checks.
 */
export function computeBillStatus({ orderBill, bills, preauthRequests, blockedPaymentModes }: BillStatusInputs): {
  status: BillStatus;
  lineItem?: LineItem;
} {
  if (!orderBill || !bills) {
    return { status: 'BLANK' };
  }
  const bill = bills.find((b) => b.uuid === orderBill.bill_uuid);
  const lineItem = bill?.lineItems?.find((item) => item.uuid === orderBill.line_item_uuid);
  if (!lineItem) {
    return { status: 'BLANK' };
  }
  const prepaidModes = blockedPaymentModes.map((mode) => mode.toUpperCase());
  if (prepaidModes.includes(lineItem.priceName?.toUpperCase())) {
    return { status: lineItem.status as BillStatus, lineItem };
  }
  if (!orderBill.consent_token) {
    return { status: 'AWAITING CLAIM VISIT', lineItem };
  }
  if (!orderBill.requires_preauth) {
    return { status: 'PAID', lineItem };
  }
  const intervention = preauthRequests?.find((request) => request.interventionCode === orderBill.intervention_code);
  switch (intervention?.status?.trim()?.toUpperCase()) {
    case 'ACTIVE':
      return { status: 'PENDING PREAUTHORIZATION', lineItem };
    case 'FINALISED':
      return { status: 'PAID', lineItem };
    case 'REJECTED':
      return { status: 'PREAUTHORIZATION REJECTED', lineItem };
    default:
      return { status: 'NEEDS PREAUTHORIZATION', lineItem };
  }
}

/** Bill statuses that clear an order for hand-over to the patient. */
export function isBillCleared(status: BillStatus) {
  return status === 'PAID' || status === 'POSTED';
}

export function useOrderBillStatus(
  order: Order,
  bills: Array<BillInvoice>,
  isLoadingBills: boolean,
  preauthRequests: Array<PreauthRequest>,
  isLoadingPreauthRequests: boolean,
) {
  const { enableOdooBilling, blockedPaymentModes } = useConfig<Config>();
  const { orderBill, isLoadingOrderBill } = useOrderBill(order?.orderNumber);
  const { odooBills, isLoadingOdooBills } = useOdooBills(order?.patient?.uuid, enableOdooBilling);
  const invalidateBills = useInvalidateBills(order?.patient?.uuid);
  const invalidateOrderBill = useInvalidateOrderBill(order?.orderNumber);

  const mutated = useCallback(() => {
    invalidateBills();
    invalidateOrderBill();
  }, [invalidateBills, invalidateOrderBill]);

  const isLoading = isLoadingBills || isLoadingOrderBill || isLoadingPreauthRequests || isLoadingOdooBills;

  const { status, lineItem } = useMemo(() => {
    if (enableOdooBilling) {
      const line = odooBills?.orders?.[0]?.order_lines?.find((o) => o.openmrs_order_id === order?.uuid);
      if (!line) {
        return { status: 'BLANK' as BillStatus };
      }
      return { status: (line.billing_status.toUpperCase() === 'PAID' ? 'PAID' : 'PENDING') as BillStatus };
    }
    if (isLoading) {
      return { status: 'BLANK' as BillStatus };
    }
    return computeBillStatus({ orderBill, bills, preauthRequests, blockedPaymentModes });
  }, [enableOdooBilling, odooBills, order, isLoading, orderBill, bills, preauthRequests, blockedPaymentModes]);

  return { status, lineItem, orderBill, isLoading, mutated };
}
