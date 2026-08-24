import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMedicalSupplyOrders } from '../../resources/medical-supply.resources';
import SummaryTile from '../summary-tile/summary-tile.component';

const DeclinedRequestsTile = () => {
  const { t } = useTranslation();
   const { orders } = useMedicalSupplyOrders("DECLINED");

  return (
    <SummaryTile
      label={t('declined', 'Declined')}
      value={orders?.length}
      headerLabel={t('medicalSupplyDeclined', 'Medical supply declined')}
    />
  );
};

export default DeclinedRequestsTile;
