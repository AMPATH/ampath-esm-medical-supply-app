import React, { useMemo, useState } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Dropdown,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { ExtensionSlot, formatDate, parseDate, showModal, useConfig, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type FulfillerStatus, type FlattenedOrder, type Order } from '../types';
import { type Config } from '../config-schema';
import { useMedicalSupplyOrders, useQueueEntries } from '../resources/medical-supply.resources';
import { OrdersDateRangePicker } from './orders-date-range-picker.component';
import ListOrderDetails from './list-order-details.component';
import styles from './orders-data-table.scss';
import PriorityTag from './priority-tag.component';

const tableColumnSpec = {
  patientName: {
    headerLabelKey: 'patientName',
    headerLabelDefault: 'Patient',
    key: 'patientName',
  },
  patientAge: {
    headerLabelKey: 'patientAge',
    headerLabelDefault: 'Age',
    key: 'patientAge',
  },
  // patientDob: {
  //   headerLabelKey: 'patientDob',
  //   headerLabelDefault: 'Date of Birth',
  //   key: 'patientDob',
  // },
  patientSex: {
    headerLabelKey: 'patientSex',
    headerLabelDefault: 'Sex',
    key: 'patientSex',
  },
  priority: {
    // t('priority', 'Priority')
    headerLabelKey: 'priority',
    headerLabelDefault: 'Priority',
    key: 'priority',
  },
  totalOrders: {
    headerLabelKey: 'totalOrders',
    headerLabelDefault: 'Total Orders',
    key: 'totalOrders',
  },
  // action: {
  //   headerLabelKey: 'action',
  //   headerLabelDefault: 'Action',
  //   key: 'action',
  // },
  patientId: {
    headerLabelKey: 'patientId',
    headerLabelDefault: 'Patient ID',
    key: 'patientId',
  },
  phoneNumber: {
    // t('phoneNumber', 'Phone number')
    headerLabelKey: 'phoneNumber',
    headerLabelDefault: 'Phone number',
    key: 'phoneNumber',
  },
};

export interface OrdersDataTableProps {
  status: string;
}

const OrdersDataTable: React.FC<OrdersDataTableProps> = (props) => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const { queueEntries } = useQueueEntries();
  const { patientIdIdentifierTypeUuid, personAttributeTypeUuid } = useConfig<Config>();

  const { orders, isLoading } = useMedicalSupplyOrders(
    props.status
  );

  const flattenedLabOrders: Array<FlattenedOrder> = useMemo(() => {
    return (
      orders?.map((order) => {
        return {
          id: order.uuid,
          patientUuid: order.patient.uuid,
          orderNumber: order.orderNumber,
          dateActivated: formatDate(parseDate(order.dateActivated)),
          fulfillerStatus: order.fulfillerStatus,
          urgency: order.urgency,
          orderer: order.orderer?.display,
          instructions: order.instructions,
          fulfillerComment: order.fulfillerComment,
          display: order.display,
        };
      }) ?? []
    );
  }, [orders]);

  const groupedOrdersByPatient = useMemo(() => {
    if (orders && orders.length > 0) {
      const patientUuids = [...new Set(orders.map((order) => order.patient.uuid))];

      return patientUuids.map((patientUuid) => {
        const labOrdersForPatient = orders.filter((order) => order.patient.uuid === patientUuid);
        const patient = labOrdersForPatient[0]?.patient;
        const flattenedLabOrdersForPatient = flattenedLabOrders.filter((order) => order.patientUuid === patientUuid);

        const priority = queueEntries?.find((q) => q.patient_uuid === patientUuid)?.priority ?? 'NON-URGENT';

        return {
          patientId: patient?.identifiers
            ?.filter((identifier) =>
                !identifier.voided &&
                patientIdIdentifierTypeUuid && patientIdIdentifierTypeUuid.length
                ? patientIdIdentifierTypeUuid.includes(identifier.identifierType.uuid) : true,
            )
            ?.map((identifier) => identifier.identifier)
            ?.join(','),
          patientUuid: patientUuid,
          patientName: patient?.person?.display,
          patientAge: patient?.person?.age,
          patientDob: patient?.person?.birthdate ? formatDate(parseDate(patient.person.birthdate)) : undefined,
          patientSex: patient?.person?.gender,
          priority: priority,
          totalOrders: flattenedLabOrdersForPatient.length,
          orders: flattenedLabOrdersForPatient,
          originalOrders: labOrdersForPatient,
          phoneNumber: patient?.person?.attributes
            ?.filter((attribute) =>
              personAttributeTypeUuid && personAttributeTypeUuid.length
                ? personAttributeTypeUuid.includes(attribute.attributeType.uuid)
                : true,
            )
            ?.map((attribute) => attribute.value)
            ?.join(','),
        };
      });
    } else {
      return [];
    }
  }, [flattenedLabOrders, orders]);

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const lowerSearchString = searchString.toLowerCase();
      return groupedOrdersByPatient.filter(
        (orderGroup) =>
          (orderGroup.patientName?.toLowerCase().includes(lowerSearchString)) ||
          (orderGroup.patientId?.toLowerCase().includes(lowerSearchString)) ||
          orderGroup.orders.some((order) => order.orderNumber?.toLowerCase().includes(lowerSearchString)),
      );
    }

    return groupedOrdersByPatient;
  }, [searchString, groupedOrdersByPatient]);

  const orderStatuses = [
    { value: null, display: t('all', 'All') },
    { value: 'RECEIVED', display: t('receivedStatus', 'RECEIVED') },
    { value: 'IN_PROGRESS', display: t('inProgressStatus', 'IN_PROGRESS') },
    { value: 'COMPLETED', display: t('completedStatus', 'COMPLETED') },
    { value: 'EXCEPTION', display: t('exceptionStatus', 'EXCEPTION') },
    { value: 'ON_HOLD', display: t('onHoldStatus', 'ON_HOLD') },
    { value: 'DECLINED', display: t('declinedStatus', 'DECLINED') },
  ];

  const columns = useMemo(() => {
    return Object.entries(tableColumnSpec)
      .map(([key, value]) => {
        return { header: value.headerLabelDefault, key: key, id: key };
      });
  }, []);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const { goTo, results: paginatedLabOrders, currentPage } = usePagination(searchResults, currentPageSize);

  const handlePrintModal = (orders: Array<Order>) => {
    const completedOrders = orders.filter((order) => order.fulfillerStatus === 'COMPLETED');
    const dispose = showModal('print-lab-results-modal', {
      closeModal: () => dispose(),
      orders: completedOrders,
    });
  };

  const handleLaunchModal = (orders: Array<Order>) => {
    const completedOrders = orders.filter((order) => order.fulfillerStatus === 'COMPLETED');
    const dispose = showModal('edit-lab-results-modal', {
      orders: completedOrders,
      closeModal: () => dispose(),
      patient: completedOrders[0]?.patient,
      workspaceName: 'lab-app-test-results-form-workspace',
    });
  };

  const tableRows = useMemo(() => {
    return paginatedLabOrders.map((groupedOrder) => ({
      ...groupedOrder,
      id: groupedOrder.patientUuid,
      action: groupedOrder.orders.some((o) => o.fulfillerStatus === 'COMPLETED') ? (
        <div className={styles.actionCell}>
          <OverflowMenu aria-label="Actions" flipped iconDescription="Actions">
            <ExtensionSlot
              className={styles.transitionOverflowMenuItemSlot}
              name="transition-overflow-menu-item-slot"
              state={{ patientUuid: groupedOrder.patientUuid }}
              // Without tabIndex={0} here, the overflow menu incorrectly sets initial focus to the second item instead of the first.
              tabIndex={0}
            />
            <OverflowMenuItem
              className={styles.menuitem}
              itemText={t('editResults', 'Edit results')}
              onClick={() => handleLaunchModal(groupedOrder.originalOrders)}
            />
            <OverflowMenuItem
              className={styles.menuitem}
              itemText={t('printTestResults', 'Print test results')}
              onClick={() => handlePrintModal(groupedOrder.originalOrders)}
            />
          </OverflowMenu>
        </div>
      ) : null,
    }));
  }, [paginatedLabOrders, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" showHeader={false} showToolbar={false} />;
  }

  return (
    <DataTable rows={tableRows} headers={columns} useZebraStyles>
      {({ getExpandHeaderProps, getHeaderProps, getRowProps, getTableProps, headers, rows }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbar>
            <TableToolbarContent className={styles.tableToolBar}>
              <Layer className={styles.toolbarItem}>
                <OrdersDateRangePicker />
              </Layer>
              <Layer className={styles.toolbarItem}>
                <TableToolbarSearch
                  expanded
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchString(e.target.value)}
                  placeholder={t('searchThisList', 'Search this list')}
                  size="sm"
                />
              </Layer>
            </TableToolbarContent>
          </TableToolbar>
          <Table className={styles.tableWrapper} {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableExpandRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => {
                      if (cell.info.header === 'priority') {
                        return (
                          <TableCell key={cell.id}>
                            <PriorityTag status={cell.value?.content ?? cell.value} />
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      )
                    })}
                  </TableExpandRow>
                  {row.isExpanded ? (
                    <TableExpandedRow colSpan={headers.length + 2}>
                      <ListOrderDetails
                        groupedOrders={groupedOrdersByPatient.find((item) => item.patientUuid === row.id)}
                        patientUuid={row.id}
                      />
                    </TableExpandedRow>
                  ) : (
                    <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>{t('noMedicalSupplyRequestsFound', 'No medical supply requests found')}</p>
                  <p className={styles.emptyStateHelperText}>
                    {t('checkFilters', 'Please check the filters above and try again')}
                  </p>
                </div>
              </Tile>
            </div>
          ) : null}
          {rows.length > 0 && (
            <Pagination
              forwardText={t('nextPage', 'Next page')}
              backwardText={t('previousPage', 'Previous page')}
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={searchResults?.length}
              className={styles.pagination}
              onChange={({ pageSize, page }) => {
                if (pageSize !== currentPageSize) setPageSize(pageSize);
                if (page !== currentPage) goTo(page);
              }}
            />
          )}
        </TableContainer>
      )}
    </DataTable>
  );
};

export default OrdersDataTable;
