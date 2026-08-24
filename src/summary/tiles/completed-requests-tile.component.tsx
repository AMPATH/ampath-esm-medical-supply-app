import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMedicalSupplyOrders } from '../../resources/medical-supply.resources';
import SummaryTile from '../summary-tile/summary-tile.component';

const CompletedRequestsTile = () => {
  const { t } = useTranslation();
   const { orders } = useMedicalSupplyOrders("COMPLETED");

  return (
    <SummaryTile
      label={t('completed', 'Completed')}
      value={orders?.length}
      headerLabel={t('medicalSupplyCompleted', 'Medical supply completed')}
    />
  );
};

export default CompletedRequestsTile;
