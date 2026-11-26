import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommodityOrders } from '../../resources/medical-supply.resources';
import { useCommodity } from '../../commodity';
import SummaryTile from '../summary-tile/summary-tile.component';

const DeclinedRequestsTile = () => {
  const { t } = useTranslation();
   const commodity = useCommodity();
   const { orders } = useCommodityOrders("DECLINED");

  return (
    <SummaryTile
      label={t('declined', 'Declined')}
      value={orders?.length}
      headerLabel={t('commodityDeclined', '{{commodity}} declined', { commodity: commodity?.title ?? '' })}
    />
  );
};

export default DeclinedRequestsTile;
