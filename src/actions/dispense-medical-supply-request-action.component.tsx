import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, type Order } from '@openmrs/esm-framework';
import styles from './actions.scss';
import { type BillStatus } from '../types';

interface DispenseMedicalSupplyRequestActionMenuProps {
  order: Order;
  billStatus: BillStatus;
}

const DispenseMedicalSupplyRequestAction: React.FC<DispenseMedicalSupplyRequestActionMenuProps> = ({ order, billStatus }) => {
  const { t } = useTranslation();

  const launchModal = useCallback(() => {
    const dispose = showModal('dispense-medical-supply-request-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return billStatus === 'PAID' || billStatus === 'POSTED' ? (
    <Button
      className={styles.actionButton}
      size="sm"
      kind="primary"
      key={order.uuid}
      onClick={launchModal}
    >
      {t('dispense', 'Dispense')}
    </Button>
  ) : null;
};

export default DispenseMedicalSupplyRequestAction;
