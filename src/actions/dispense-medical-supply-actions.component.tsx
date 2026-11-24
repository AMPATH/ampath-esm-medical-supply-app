import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { ExtensionSlot, launchWorkspace2, showModal, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { isBillCleared, useOrderBillStatus } from '../bill/order-bill-status';
import type { PreauthRequest } from '../bill/bill.types';
import { type Config } from '../config-schema';
import {
  createDispense,
  dispenseErrorMessage,
  updateDispense,
  useInvalidateOrderDispenses,
  useOrderDispenses,
  voidDispense,
} from '../resources/commodity-dispense.resource';
import { useInvalidateMedicalSupplyOrders } from '../resources/medical-supply.resources';
import { type BillInvoice, type Order } from '../types';
import styles from './actions.scss';

interface DispenseMedicalSupplyActionsProps {
  order: Order;
  bills?: Array<BillInvoice>;
  isLoading?: boolean;
  preauthRequests?: Array<PreauthRequest>;
  isLoadingPreauthRequests?: boolean;
}

/**
 * Dispensing for a picked-up order, one dispense per order:
 * 1. Dispense: choose the quantity; saved as a PENDING dispense that reserves it.
 * 2. Bill that quantity (the order's bill line is linked to the dispense as its bill reference).
 * 3. Hand over once the bill is cleared: prepaid modes need the line PAID, others follow the
 *    claim and pre-authorization status. Any undispensed remainder is then declined, closing the order.
 */
const DispenseMedicalSupplyActions: React.FC<DispenseMedicalSupplyActionsProps> = ({
  order,
  bills = [],
  isLoading = false,
  preauthRequests = [],
  isLoadingPreauthRequests = false,
}) => {
  const { t } = useTranslation();
  const { medicalSupplyServiceTypedUuid, undispensedReasonConceptUuid } = useConfig<Config>();
  const { currentProvider, sessionLocation } = useSession();
  const { dispenses, isLoading: isLoadingDispenses } = useOrderDispenses(order.uuid);
  const invalidateDispenses = useInvalidateOrderDispenses();
  const invalidateOrders = useInvalidateMedicalSupplyOrders();
  const {
    status: billStatus,
    lineItem,
    orderBill,
    isLoading: isLoadingBill,
    mutated,
  } = useOrderBillStatus(order, bills, isLoading, preauthRequests, isLoadingPreauthRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pending = dispenses.find((dispense) => dispense.status === 'PENDING');

  const launchBillWorkspace = useCallback(
    (quantity: number) => {
      launchWorkspace2('create-order-bill-form-workspace', {
        workspaceTitle: t('createOrderBill', 'Create order bill form'),
        order,
        quantity,
        serviceTypeUuid: medicalSupplyServiceTypedUuid,
        servicePointName: 'MEDICAL SUPPLY',
        mutated,
      });
    },
    [t, order, medicalSupplyServiceTypedUuid, mutated],
  );

  // The bill form does not return the line it creates; once the order's bill line appears, link it
  // to the pending dispense. The backend only accepts a bill reference once, so this runs at most once.
  const linkingDispense = useRef<string>();
  useEffect(() => {
    const lineItemUuid = orderBill?.line_item_uuid;
    if (!pending || pending.billReference || !lineItemUuid || linkingDispense.current === pending.uuid) {
      return;
    }
    linkingDispense.current = pending.uuid;
    updateDispense(pending.uuid, { billReference: lineItemUuid }).then(invalidateDispenses, (error) => {
      linkingDispense.current = undefined;
      showSnackbar({
        kind: 'error',
        isLowContrast: false,
        title: t('errorLinkingBill', 'Could not link the bill to the dispense'),
        subtitle: dispenseErrorMessage(error),
      });
    });
  }, [pending, orderBill, invalidateDispenses, t]);

  const openDispenseModal = () => {
    const dispose = showModal('dispense-medical-supply-request-modal', {
      closeModal: () => dispose(),
      order,
      billedQuantity: lineItem ? Number(lineItem.quantity) : undefined,
      launchBillWorkspace,
    });
  };

  const handOver = async () => {
    setIsSubmitting(true);
    try {
      await updateDispense(pending.uuid, { status: 'COMPLETED' });
      const remainder = Number(order.quantity) - Number(pending.quantity);
      if (remainder > 0 && undispensedReasonConceptUuid) {
        await createDispense({
          order: order.uuid,
          status: 'DECLINED',
          statusReason: undispensedReasonConceptUuid,
          dispenser: currentProvider?.uuid,
          location: sessionLocation?.uuid,
          comment: `Not dispensed: ${remainder} of ${order.quantity}`,
        });
      }
      showSnackbar({
        kind: 'success',
        isLowContrast: true,
        title: t('handedOver', 'Handed over'),
        subtitle: t('orderDispensedSuccessfully', 'You have successfully dispensed the order'),
      });
    } catch (error) {
      showSnackbar({
        kind: 'error',
        isLowContrast: false,
        title: t('errorDispensingOrder', 'Error dispensing order'),
        subtitle: dispenseErrorMessage(error),
      });
    } finally {
      invalidateDispenses();
      invalidateOrders();
      setIsSubmitting(false);
    }
  };

  const cancelDispense = async () => {
    setIsSubmitting(true);
    try {
      await voidDispense(pending.uuid, 'Cancelled before hand-over');
      showSnackbar({
        kind: pending.billReference ? 'warning' : 'success',
        isLowContrast: true,
        title: t('dispenseCancelled', 'Dispense cancelled'),
        subtitle: pending.billReference
          ? t(
              'billNotChanged',
              'The bill line for this dispense was not changed. Void it, or refund it if paid, in billing.',
            )
          : undefined,
      });
    } catch (error) {
      showSnackbar({
        kind: 'error',
        isLowContrast: false,
        title: t('errorCancellingDispense', 'Error cancelling dispense'),
        subtitle: dispenseErrorMessage(error),
      });
    } finally {
      invalidateDispenses();
      invalidateOrders();
      setIsSubmitting(false);
    }
  };

  if (isLoadingDispenses || isLoadingBill) {
    return <InlineLoading />;
  }

  if (!pending) {
    return (
      <Button className={styles.actionButton} size="sm" kind="primary" onClick={openDispenseModal}>
        {t('dispense', 'Dispense')}
      </Button>
    );
  }

  const units = pending.quantityUnits?.display ?? order.quantityUnits?.display ?? '';
  const cleared = Boolean(pending.billReference) && isBillCleared(billStatus);

  return (
    <>
      <span className={styles.dispenseSummary}>
        {t('dispensingQuantity', 'Dispensing {{quantity}} {{units}}', { quantity: pending.quantity, units })}
      </span>
      <ExtensionSlot
        name="generate-order-bill-button-slot"
        state={{
          order,
          billStatus,
          isLoading: isLoadingBill,
          launchBillWorkspace: () => launchBillWorkspace(Number(pending.quantity)),
        }}
      />
      <Button
        className={styles.actionButton}
        size="sm"
        kind="primary"
        disabled={!cleared || isSubmitting}
        onClick={handOver}
      >
        {t('handOver', 'Hand over')}
      </Button>
      <Button className={styles.actionButton} size="sm" kind="ghost" disabled={isSubmitting} onClick={cancelDispense}>
        {t('cancelDispense', 'Cancel dispense')}
      </Button>
    </>
  );
};

export default DispenseMedicalSupplyActions;
