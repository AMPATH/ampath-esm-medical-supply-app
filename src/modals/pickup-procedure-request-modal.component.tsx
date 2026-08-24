import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showSnackbar, useAbortController, type Order } from '@openmrs/esm-framework';
import { setFulfillerStatus, useInvalidateMedicalSupplyOrders } from '../resources/medical-supply.resources';

interface PickupMedicalSupplyRequestModal {
  closeModal: () => void;
  order: Order;
}

const PickupMedicalSupplyRequestModal: React.FC<PickupMedicalSupplyRequestModal> = ({ order, closeModal }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortController = useAbortController();
  const invalidateOrders = useInvalidateMedicalSupplyOrders();

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
      <ModalHeader closeModal={closeModal} title={t('medicalSupplyRequest', 'MedicalSupply request')} />
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
          {t('pickupMedicalSupplyRequest', 'Pick up medical supply request')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default PickupMedicalSupplyRequestModal;
