import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PageHeader, StockManagementPictogram, useDefineAppContext } from '@openmrs/esm-framework';
import { type DateFilterContext } from './types';
import styles from './medical-supply-dashboard.scss';
import MedicalSupplySummaryTiles from './summary/medical-supply-summary-tiles.component';
import MedicalSupplyOrdersTabs from './tabs/medical-supply-tabs.component';

const MedicalSupplyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Date, Date]>([dayjs().startOf('day').toDate(), new Date()]);
  useDefineAppContext<DateFilterContext>('medical-supply-date-filter', { dateRange, setDateRange });

  return (
    <div>
      <PageHeader
        illustration={<StockManagementPictogram />}
        title={t('medicalSupply', 'Medical supply')}
        className={styles.pageHeader}
      />
      <div>
        <MedicalSupplySummaryTiles />
        <MedicalSupplyOrdersTabs />
      </div>
    </div>
  );
};

export default MedicalSupplyDashboard;
