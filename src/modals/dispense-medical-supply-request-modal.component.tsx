import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, ModalBody, ModalFooter, ModalHeader, NumberInput } from '@carbon/react';
import { formatDate, parseDate, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { commodityNoun, useCommodity } from '../commodity';
import { type Config } from '../config-schema';
import { OrderDetailRow } from '../orders-table/list-order-details.component';
import {
  createDispense,
  dispenseErrorMessage,
  useInvalidateOrderDispenses,
} from '../resources/commodity-dispense.resource';
import { type Order } from '../types';

interface DispenseMedicalSupplyRequestModalProps {
  closeModal: () => void;
  order: Order;
  /** Quantity on a bill line already linked to the order; the dispense must match it. */
  billedQuantity?: number;
  /** Opens the bill form for the dispensed quantity when the order has no bill yet. */
  launchBillWorkspace?: (quantity: number) => void;
}

/**
 * Step one of dispensing: record how much will be dispensed. The dispense is saved as PENDING,
 * which reserves the quantity; it is billed next and handed over once the bill is cleared.
 */
const DispenseMedicalSupplyRequestModal: React.FC<DispenseMedicalSupplyRequestModalProps> = ({
  order,
  closeModal,
  billedQuantity,
  launchBillWorkspace,
}) => {
  const { t } = useTranslation();
  const { undispensedReasonConceptUuid } = useConfig<Config>();
  const { currentProvider, sessionLocation } = useSession();
  const invalidateDispenses = useInvalidateOrderDispenses();
  const commodity = useCommodity();

  const orderedQuantity = Number(order.quantity);
  const unitsDisplay = order.quantityUnits?.display ?? '';
  const quantityLocked = billedQuantity != null || !undispensedReasonConceptUuid;
  const [quantity, setQuantity] = useState<number>(billedQuantity ?? orderedQuantity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quantityInvalid = !(quantity > 0) || quantity > orderedQuantity;
  const missingProvider = !currentProvider?.uuid;

  const handleDispense = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await createDispense({
        order: order.uuid,
        status: 'PENDING',
        quantity,
        quantityUnits: order.quantityUnits?.uuid,
        dispenser: currentProvider.uuid,
        location: sessionLocation?.uuid,
      });
      invalidateDispenses();
      closeModal();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('dispenseStarted', 'Dispense started'),
        subtitle: billedQuantity
          ? t('dispenseReadyForHandOver', 'Hand over once the bill is cleared.')
          : t('dispenseReadyForBilling', 'Generate the bill for the dispensed quantity.'),
      });
      if (billedQuantity == null) {
        launchBillWorkspace?.(quantity);
      }
    } catch (e) {
      setError(dispenseErrorMessage(e));
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('dispenseCommodity', 'Dispense {{commodity}}', { commodity: commodityNoun(commodity) })} />
      <ModalBody>
        <div>
          <OrderDetailRow label={t('order', 'Order:')} value={order.display} />
          <OrderDetailRow
            label={t('orderedQuantity', 'Ordered quantity:')}
            value={`${orderedQuantity} ${unitsDisplay}`}
          />
          <OrderDetailRow label={t('orderNumbers', 'Order number:')} value={order.orderNumber} />
          <OrderDetailRow label={t('orderDate', 'Order date:')} value={formatDate(parseDate(order.dateActivated))} />
          <OrderDetailRow label={t('orderedBy', 'Ordered By:')} value={order.orderer?.display} />
        </div>
        <NumberInput
          id="dispense-quantity"
          label={t('quantityToDispense', 'Quantity to dispense ({{units}})', { units: unitsDisplay })}
          min={0}
          max={orderedQuantity}
          value={quantity}
          disabled={quantityLocked}
          invalid={quantityInvalid}
          invalidText={t('quantityToDispenseInvalid', 'Enter a quantity between 1 and {{max}}', {
            max: orderedQuantity,
          })}
          helperText={
            billedQuantity != null
              ? t('quantityMatchesBill', 'Matches the quantity already billed for this order.')
              : quantityLocked
                ? t('partialDispenseDisabled', 'Partial dispensing is not configured; the full quantity is dispensed.')
                : quantity < orderedQuantity
                  ? t('remainderWillBeDeclined', 'The remaining {{remainder}} will be declined on hand-over.', {
                      remainder: orderedQuantity - quantity,
                    })
                  : undefined
          }
          onChange={(_event, { value }) => setQuantity(Number(value))}
        />
        {missingProvider && (
          <InlineNotification
            kind="error"
            hideCloseButton
            lowContrast
            title={t('noProviderAccount', 'Your user account has no provider')}
            subtitle={t('noProviderAccountHelp', 'A provider account is needed to record who dispensed.')}
          />
        )}
        {error && (
          <InlineNotification
            kind="error"
            hideCloseButton
            lowContrast
            title={t('errorDispensingOrder', 'Error dispensing order')}
            subtitle={error}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleDispense} disabled={isSubmitting || quantityInvalid || missingProvider}>
          {billedQuantity != null ? t('dispense', 'Dispense') : t('dispenseAndBill', 'Dispense and bill')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DispenseMedicalSupplyRequestModal;
