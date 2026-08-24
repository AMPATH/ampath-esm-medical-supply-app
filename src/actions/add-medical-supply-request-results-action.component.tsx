import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AddIcon, launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-framework';
import { type Config } from '../config-schema';
import styles from './actions.scss';

interface AddMedicalSupplyRequestResultsActionProps {
  order: Order;
}

const AddMedicalSupplyRequestResultsAction: React.FC<AddMedicalSupplyRequestResultsActionProps> = ({ order }) => {
  const { t } = useTranslation();
  const { medicalSupplyOrderTypeUuid } = useConfig<Config>();

  const launchTestResultsWorkspace = () => {
    launchWorkspace('post-medical-supply-form-workspace', {
      patient: order.patient,
      order
    });
  };

  return (
    <Button
      className={styles.actionButton}
      kind="primary"
      renderIcon={() => <AddIcon className={styles.actionButtonIcon} />}
      iconDescription={t('addMedicalSupplyResult', 'Add medical supply results')}
      onClick={launchTestResultsWorkspace}
      size="sm"
    >
      {t('addMedicalSupplyResult', 'Add medical supply results')}
    </Button>
  );
};

export default AddMedicalSupplyRequestResultsAction;
