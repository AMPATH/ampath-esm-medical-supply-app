import React from 'react';
import OrdersDataTable from '../orders-table/orders-data-table.component';

const InProgressRequestsTable: React.FC = () => {
  return <OrdersDataTable status="IN_PROGRESS" />;
};

export default InProgressRequestsTable;
