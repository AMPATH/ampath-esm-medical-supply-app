import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { type BillInvoice, type BillStatus, type Order } from '../../types';
import React, { useEffect, useState } from 'react';
import { useInvalidateBills, useInvalidateOrderBill, useOdooBills, useOrderBill } from '../../bill/bill.resource';
import { type Config } from '../../config-schema';
import { InlineLoading } from '@carbon/react';
import { PreauthRequest } from '../../bill/bill.types';
import styles from './ordered-actions-extension-slot.scss';

interface OrderedActionsExtensionSlotProps {
  order: Order;
  bills: BillInvoice[];
  isLoading: boolean;
  preauthRequests: PreauthRequest[];
  isLoadingPreauthRequests: boolean;
}

const OrderedActionsExtensionSlot: React.FC<OrderedActionsExtensionSlotProps> = ({ order, bills, isLoading, preauthRequests, isLoadingPreauthRequests }) => {
  const [status, setStatus] = useState<BillStatus>('BLANK');
  const invalidateBills = useInvalidateBills(order?.patient?.uuid);
  const invalidateOrderBill = useInvalidateOrderBill(order?.orderNumber);
  const { enableOdooBilling, blockedPaymentModes } = useConfig<Config>();
  const { orderBill, isLoadingOrderBill } = useOrderBill(order?.orderNumber);
  const { odooBills, isLoadingOdooBills } = useOdooBills(order?.patient?.uuid, enableOdooBilling);

  const mutated = () => {
    invalidateBills();
    invalidateOrderBill();
  };

  useEffect(() => {
    if (!enableOdooBilling) {
      if (!isLoading && !isLoadingOrderBill && orderBill && bills) {
        const billUuid = orderBill?.bill_uuid;
        const lineItemUuid = orderBill?.line_item_uuid;
        const bill = bills.find((b) => b.uuid === billUuid);
        const lineItem = bill?.lineItems?.find((i) => i.uuid === lineItemUuid);
        if (lineItem) {
          setStatus('PAID');
        } else {
          setStatus('BLANK');
        }
      }
    } else {
      if (odooBills && odooBills.orders && odooBills.orders[0].order_lines && odooBills.orders[0].order_lines.length) {
        const currentOrder = odooBills.orders[0].order_lines.find((o) => o.openmrs_order_id === order?.uuid);
        if (currentOrder) {
          setStatus('PAID');
        } else {
          setStatus('PENDING');
        }
      }
    }
  }, [order, isLoading, bills, odooBills, orderBill, isLoadingOrderBill, blockedPaymentModes, enableOdooBilling]);

  if (isLoadingOdooBills || isLoading || isLoadingOrderBill) {
    return <InlineLoading />;
  }

  return (
    <ExtensionSlot
      className={styles.orderedActionsSlot}
      state={{ order: order, billStatus: status, isLoading, mutated }}
      name="medical-supply-ordered-actions-slot"
    />
  );
};

export default OrderedActionsExtensionSlot;
