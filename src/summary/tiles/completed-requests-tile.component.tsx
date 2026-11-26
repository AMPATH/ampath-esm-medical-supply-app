import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommodityOrders } from '../../resources/medical-supply.resources';
import { useCommodity } from '../../commodity';
import SummaryTile from '../summary-tile/summary-tile.component';

const CompletedRequestsTile = () => {
  const { t } = useTranslation();
   const commodity = useCommodity();
   const { orders } = useCommodityOrders("COMPLETED");

  return (
    <SummaryTile
      label={t('completed', 'Completed')}
      value={orders?.length}
      headerLabel={t('commodityCompleted', '{{commodity}} completed', { commodity: commodity?.title ?? '' })}
    />
  );
};

export default CompletedRequestsTile;
