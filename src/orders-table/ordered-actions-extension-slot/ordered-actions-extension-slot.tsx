import React from 'react';
import { InlineLoading } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { useOrderBillStatus } from '../../bill/order-bill-status';
import type { PreauthRequest } from '../../bill/bill.types';
import { type BillInvoice, type Order } from '../../types';
import styles from './ordered-actions-extension-slot.scss';

interface OrderedActionsExtensionSlotProps {
  order: Order;
  bills: BillInvoice[];
  isLoading: boolean;
  preauthRequests: PreauthRequest[];
  isLoadingPreauthRequests: boolean;
}

/**
 * Actions for orders not yet picked up (pick up, reject). Billing happens later, at dispense time,
 * for the quantity actually dispensed.
 */
const OrderedActionsExtensionSlot: React.FC<OrderedActionsExtensionSlotProps> = ({
  order,
  bills,
  isLoading,
  preauthRequests,
  isLoadingPreauthRequests,
}) => {
  const {
    status,
    isLoading: isLoadingBillStatus,
    mutated,
  } = useOrderBillStatus(order, bills, isLoading, preauthRequests, isLoadingPreauthRequests);

  if (isLoadingBillStatus) {
    return <InlineLoading />;
  }

  return (
    <ExtensionSlot
      className={styles.orderedActionsSlot}
      state={{ order, billStatus: status, isLoading: isLoadingBillStatus, mutated }}
      name="medical-supply-ordered-actions-slot"
    />
  );
};

export default OrderedActionsExtensionSlot;
