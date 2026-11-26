import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, type Order } from '@openmrs/esm-framework';
import styles from './actions.scss';

interface PickMedicalSupplyRequestActionMenuProps {
  order: Order;
}

const PickupMedicalSupplyRequestAction: React.FC<PickMedicalSupplyRequestActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();
  const unsupportedStatuses = ['COMPLETED', 'DECLINED', 'IN_PROGRESS', 'ON_HOLD'];

  const launchModal = useCallback(() => {
    const dispose = showModal('pickup-medical-supply-request-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  // Billing happens at dispense time for the quantity dispensed, so picking up no longer waits for a bill.
  return (
    <Button
      className={styles.actionButton}
      disabled={unsupportedStatuses.includes(order.fulfillerStatus)}
      size="sm"
      kind="primary"
      key={order.uuid}
      onClick={launchModal}
    >
      {t('pickUpOrder', 'Pick up')}
    </Button>
  );
};

export default PickupMedicalSupplyRequestAction;
