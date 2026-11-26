import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommodityOrders } from '../../resources/medical-supply.resources';
import { useCommodity } from '../../commodity';
import SummaryTile from '../summary-tile/summary-tile.component';

const InProgressRequestsTile = () => {
  const { t } = useTranslation();
   const commodity = useCommodity();
   const { orders } = useCommodityOrders("IN_PROGRESS");

  return (
    <SummaryTile
      label={t('inProgress', 'In progress')}
      value={orders?.length}
      headerLabel={t('commodityInProgress', '{{commodity}} in progress', { commodity: commodity?.title ?? '' })}
    />
  );
};

export default InProgressRequestsTile;
