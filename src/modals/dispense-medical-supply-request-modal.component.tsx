import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { formatDate, parseDate, showNotification, showSnackbar, useAbortController, type Order } from '@openmrs/esm-framework';
import { setFulfillerStatus, useInvalidateMedicalSupplyOrders } from '../resources/medical-supply.resources';
import { OrderDetailRow } from '../orders-table/list-order-details.component';

interface DispenseMedicalSupplyRequestModal {
  closeModal: () => void;
  order: Order;
}

const DispenseMedicalSupplyRequestModal: React.FC<DispenseMedicalSupplyRequestModal> = ({ order, closeModal }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortController = useAbortController();
  const invalidateOrders = useInvalidateMedicalSupplyOrders();

  const handleDispense = () => {
    setIsSubmitting(true);
    setFulfillerStatus(order.uuid, 'COMPLETED', abortController).then(
      () => {
        invalidateOrders();
        setIsSubmitting(false);
        closeModal();
        showSnackbar({
          isLowContrast: true,
          title: t('dispenseMedicalSupply', 'Display medical supply'),
          kind: 'success',
          subtitle: t('orderDispensedSuccessfully', 'You have successfully dispensed the order'),
        });
      },
      (error) => {
        setIsSubmitting(false);
        showNotification({
          title: t('errorDispensingOrder', 'Error dispensing order'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('medicalSupplyRequest', 'Medical supply request')} />
      <ModalBody>
        <div>
          <OrderDetailRow label={t('order', 'Order:')} value={order.display} />
          <OrderDetailRow label={t('quantity', 'Quantity:')} value={`${order?.quantity} (${order?.quantityUnits?.name?.display})`} />
          <OrderDetailRow label={t('orderNumbers', 'Order number:')} value={order.orderNumber} />
          <OrderDetailRow
            label={t('orderDate', 'Order date:')}
            value={formatDate(parseDate(order.dateActivated))}
          />
          <OrderDetailRow label={t('orderedBy', 'Ordered By:')} value={order.orderer?.display} />
          <OrderDetailRow
            label={t('orderInstructions', 'Instructions:')}
            value={order.instructions ?? t('NoInstructionLeft', 'No instructions are provided.')}
          />
        </div>
        <InlineNotification kind="info" hideCloseButton lowContrast subtitle={t(
          'medicalSupplyDispenseConfirmation',
          'Selecting Dispense will move the order to "COMPLETED". Do you wish to proceed?',
        )} />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button type="submit" onClick={handleDispense} disabled={isSubmitting}>
          {t('dispense', 'Dispense')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DispenseMedicalSupplyRequestModal;
