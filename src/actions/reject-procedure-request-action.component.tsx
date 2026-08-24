import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal, type Order } from '@openmrs/esm-framework';
import styles from './actions.scss';

interface RejectMedicalSupplyRequestActionProps {
  order: Order;
}

const RejectMedicalSupplyRequestAction: React.FC<RejectMedicalSupplyRequestActionProps> = ({ order }) => {
  const { t } = useTranslation();
  const unsupportedStatuses = ['COMPLETED', 'DECLINED'];

  const launchRejectLabRequestModal = useCallback(() => {
    const dispose = showModal('reject-medical-supply-request-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <Button
      kind="danger--tertiary"
      className={styles.actionRejectButton}
      disabled={unsupportedStatuses.includes(order.fulfillerStatus)}
      key={order.uuid}
      size="sm"
      onClick={launchRejectLabRequestModal}
    >
      {t('rejectMedicalSupplyRequest', 'Reject medical supply request')}
    </Button>
  );
};

export default RejectMedicalSupplyRequestAction;
