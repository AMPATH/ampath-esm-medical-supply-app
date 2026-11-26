import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommodity } from '../../commodity';
import SummaryTile from '../summary-tile/summary-tile.component';
import { useCommodityOrders } from '../../resources/medical-supply.resources';

const OrderedRequestsTile = () => {
  const { t } = useTranslation();
  const commodity = useCommodity();
  const { orders } = useCommodityOrders("");

  return (
    <SummaryTile
      label={t('orders', 'Orders')}
      value={orders?.length}
      headerLabel={t('commodityOrdered', '{{commodity}} ordered', { commodity: commodity?.title ?? '' })}
    />
  );
};

export default OrderedRequestsTile;
