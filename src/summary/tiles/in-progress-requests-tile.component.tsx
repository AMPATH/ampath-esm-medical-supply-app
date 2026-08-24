import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMedicalSupplyOrders } from '../../resources/medical-supply.resources';
import SummaryTile from '../summary-tile/summary-tile.component';

const InProgressRequestsTile = () => {
  const { t } = useTranslation();
  const { orders } = useMedicalSupplyOrders("IN_PROGRESS");

  return (
    <SummaryTile
      label={t('inProgress', 'In progress')}
      value={orders?.length}
      headerLabel={t('worklist', 'Worklist')}
    />
  );
};

export default InProgressRequestsTile;
