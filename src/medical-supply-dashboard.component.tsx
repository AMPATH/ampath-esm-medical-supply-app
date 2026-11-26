import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { PageHeader, StockManagementPictogram, useDefineAppContext } from '@openmrs/esm-framework';
import { DATE_FILTER_CONTEXT, commodityKeyFromPath, useCommodity } from './commodity';
import { type DateFilterContext } from './types';
import styles from './medical-supply-dashboard.scss';
import MedicalSupplySummaryTiles from './summary/medical-supply-summary-tiles.component';
import MedicalSupplyOrdersTabs from './tabs/medical-supply-tabs.component';

const MedicalSupplyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Date, Date]>([dayjs().startOf('day').toDate(), new Date()]);
  useDefineAppContext<DateFilterContext>(DATE_FILTER_CONTEXT, { dateRange, setDateRange });
  const commodity = useCommodity();

  if (!commodity) {
    return (
      <InlineNotification
        kind="warning"
        hideCloseButton
        lowContrast
        title={t('commodityNotConfigured', 'This dashboard is not configured')}
        subtitle={t('commodityNotConfiguredHelp', 'Add an entry with key "{{key}}" to the commodities config.', {
          key: commodityKeyFromPath() ?? '',
        })}
      />
    );
  }

  return (
    <div>
      <PageHeader
        illustration={<StockManagementPictogram />}
        title={commodity.title}
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
