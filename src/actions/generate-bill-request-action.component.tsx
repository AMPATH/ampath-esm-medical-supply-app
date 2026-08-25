import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, launchWorkspace, useConfig, type Order } from '@openmrs/esm-framework';
import { type Config } from '../config-schema';
import { type BillStatus } from '../types';

interface GenerateBillRequestActionMenuProps {
  order: Order;
  billStatus: BillStatus;
  isLoading: boolean;
  mutated: () => void;
}

const GenerateBillRequestAction: React.FC<GenerateBillRequestActionMenuProps> = ({
  order,
  billStatus,
  isLoading,
  mutated,
}) => {
  const { t } = useTranslation();
  const { medicalSupplyServiceTypedUuid } = useConfig<Config>();

  const launchBillWorkspace = () => {
    launchWorkspace('create-order-bill-form-workspace', {
      workspaceTitle: t('createOrderBill', 'Create order bill form'),
      order,
      quantity: Number(order?.quantity),
      serviceTypeUuid: medicalSupplyServiceTypedUuid,
      servicePointName: "MEDICAL SUPPLY",
      mutated,
    });
  };

  return <ExtensionSlot state={{ order, billStatus, isLoading, launchBillWorkspace }} name="generate-order-bill-button-slot" />
};

export default GenerateBillRequestAction;
