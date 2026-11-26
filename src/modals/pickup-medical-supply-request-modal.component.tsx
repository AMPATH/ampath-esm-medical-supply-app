import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showSnackbar, useAbortController, type Order } from '@openmrs/esm-framework';
import { setFulfillerStatus, useInvalidateCommodityOrders } from '../resources/medical-supply.resources';
import { commodityNoun, useCommodity } from '../commodity';

interface PickupMedicalSupplyRequestModal {
  closeModal: () => void;
  order: Order;
}

const PickupMedicalSupplyRequestModal: React.FC<PickupMedicalSupplyRequestModal> = ({ order, closeModal }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortController = useAbortController();
  const invalidateOrders = useInvalidateCommodityOrders();
  const commodity = useCommodity();

  const handlePickup = () => {
    setIsSubmitting(true);
    setFulfillerStatus(order.uuid, 'IN_PROGRESS', abortController).then(
      () => {
        invalidateOrders();
        setIsSubmitting(false);
        closeModal();
        showSnackbar({
          isLowContrast: true,
          title: t('pickedAnOrder', 'Picked an order'),
          kind: 'success',
          subtitle: t('orderPickedSuccessfully', 'You have successfully picked an order'),
        });
      },
      (error) => {
        setIsSubmitting(false);
        showNotification({
          title: t('errorPickingOrder', 'Error picking order'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('pickUpCommodityOrder', 'Pick up {{commodity}} order', { commodity: commodityNoun(commodity) })} />
      <ModalBody>
        <p>
          {t(
            'medicalSupplyRequestConfirmation',
            'Selecting Continue will move the ticket to "In Progress". Do you wish to proceed?',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('discard', 'Discard')}
        </Button>
        <Button type="submit" onClick={handlePickup} disabled={isSubmitting}>
          {t('pickUpOrder', 'Pick up')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default PickupMedicalSupplyRequestModal;
