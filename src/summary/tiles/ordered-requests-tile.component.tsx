import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tile/summary-tile.component';
import { useMedicalSupplyOrders } from '../../resources/medical-supply.resources';

const OrderedRequestsTile = () => {
  const { t } = useTranslation();
  const { orders } = useMedicalSupplyOrders("");

  return (
    <SummaryTile
      label={t('orders', 'Orders')}
      value={orders?.length}
      headerLabel={t('medicalSupplyOrdered', 'Medical supply ordered')}
    />
  );
};

export default OrderedRequestsTile;
