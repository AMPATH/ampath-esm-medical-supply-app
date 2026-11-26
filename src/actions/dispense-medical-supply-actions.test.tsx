import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2, showModal, useConfig, useSession } from '@openmrs/esm-framework';
import { useOrderBillStatus } from '../bill/order-bill-status';
import {
  createDispense,
  updateDispense,
  useOrderDispenses,
  voidDispense,
  type CommodityDispense,
} from '../resources/commodity-dispense.resource';
import { type Order } from '../types';
import DispenseMedicalSupplyActions from './dispense-medical-supply-actions.component';

// Stand-in for the DHA app's bill button, which is rendered through an extension slot.
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  ExtensionSlot: ({ state }: { state?: { launchBillWorkspace?: () => void } }) => (
    <button onClick={() => state?.launchBillWorkspace?.()}>Generate bill</button>
  ),
}));

jest.mock('../resources/commodity-dispense.resource', () => ({
  ...jest.requireActual('../resources/commodity-dispense.resource'),
  useOrderDispenses: jest.fn(),
  useInvalidateOrderDispenses: () => jest.fn(),
  createDispense: jest.fn(() => Promise.resolve({})),
  updateDispense: jest.fn(() => Promise.resolve({})),
  voidDispense: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../resources/medical-supply.resources', () => ({
  useInvalidateCommodityOrders: () => jest.fn(),
}));

jest.mock('../commodity', () => ({
  ...jest.requireActual('../commodity'),
  useCommodity: () => ({
    key: 'nutrition',
    title: 'Nutrition',
    orderTypeUuid: 'nutrition-type',
    billableServiceTypeUuid: 'service-type',
    servicePointName: 'NUTRITION',
  }),
}));

jest.mock('../bill/order-bill-status', () => ({
  ...jest.requireActual('../bill/order-bill-status'),
  useOrderBillStatus: jest.fn(),
}));

const mockUseOrderDispenses = jest.mocked(useOrderDispenses);
const mockUseOrderBillStatus = jest.mocked(useOrderBillStatus);

const order = {
  uuid: 'order-1',
  orderNumber: 'ORD-1',
  display: 'STERILE GLOVES',
  quantity: 4,
  quantityUnits: { uuid: 'packets', display: 'PACKETS' },
  patient: { uuid: 'patient-1' },
} as unknown as Order;

const pending = (overrides: Partial<CommodityDispense> = {}): CommodityDispense => ({
  uuid: 'dispense-1',
  status: 'PENDING',
  quantity: 4,
  quantityUnits: { uuid: 'packets', display: 'PACKETS' },
  billReference: null,
  voided: false,
  ...overrides,
});

function givenDispenses(dispenses: Array<CommodityDispense>) {
  mockUseOrderDispenses.mockReturnValue({ dispenses, isLoading: false, error: undefined, mutate: jest.fn() });
}

function givenBill(status: string, extra: Record<string, unknown> = {}) {
  mockUseOrderBillStatus.mockReturnValue({
    status,
    isLoading: false,
    mutated: jest.fn(),
    orderBill: undefined,
    lineItem: undefined,
    ...extra,
  } as unknown as ReturnType<typeof useOrderBillStatus>);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useConfig).mockReturnValue({
    undispensedReasonConceptUuid: 'reason-concept',
  });
  jest.mocked(useSession).mockReturnValue({
    currentProvider: { uuid: 'provider-1' },
    sessionLocation: { uuid: 'location-1' },
  } as unknown as ReturnType<typeof useSession>);
});

describe('DispenseMedicalSupplyActions', () => {
  it('offers to dispense when the order has no pending dispense', async () => {
    givenDispenses([]);
    givenBill('BLANK');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Dispense' }));

    expect(showModal).toHaveBeenCalledWith(
      'dispense-medical-supply-request-modal',
      expect.objectContaining({ order, billedQuantity: undefined }),
    );
  });

  it('offers reject alongside dispense while nothing is billed', async () => {
    givenDispenses([]);
    givenBill('BLANK');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));

    expect(showModal).toHaveBeenCalledWith('reject-medical-supply-request-modal', expect.objectContaining({ order }));
  });

  it('hides reject once the order is billed and says why', () => {
    givenDispenses([]);
    givenBill('PENDING');
    render(<DispenseMedicalSupplyActions order={order} />);

    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    expect(screen.getByText('This order has a bill. Void it in billing before rejecting the order.')).toBeInTheDocument();
  });

  it('does not offer reject while a dispense is pending', () => {
    givenDispenses([pending()]);
    givenBill('BLANK');
    render(<DispenseMedicalSupplyActions order={order} />);

    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it('passes the quantity of an existing bill line so the dispense matches it', async () => {
    givenDispenses([]);
    givenBill('PAID', { lineItem: { quantity: '3' } });
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Dispense' }));

    expect(showModal).toHaveBeenCalledWith(
      'dispense-medical-supply-request-modal',
      expect.objectContaining({ billedQuantity: 3 }),
    );
  });

  it('keeps hand-over disabled until the dispense is billed and the bill is cleared', () => {
    givenDispenses([pending()]);
    givenBill('PAID');
    const { rerender } = render(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByRole('button', { name: 'Hand over' })).toBeDisabled();

    givenDispenses([pending({ billReference: 'line-1' })]);
    givenBill('PENDING');
    rerender(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByRole('button', { name: 'Hand over' })).toBeDisabled();

    givenBill('PAID');
    rerender(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByRole('button', { name: 'Hand over' })).toBeEnabled();
  });

  it('explains why hand-over is not available yet', () => {
    givenDispenses([pending()]);
    givenBill('BLANK');
    const { rerender } = render(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByText('Generate the bill for this quantity to continue.')).toBeInTheDocument();

    givenDispenses([pending({ billReference: 'line-1' })]);
    givenBill('AWAITING CLAIM VISIT');
    rerender(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByText('Waiting for the SHA claim visit before hand-over.')).toBeInTheDocument();

    givenBill('PENDING');
    rerender(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByText('Waiting for the bill to be paid.')).toBeInTheDocument();

    givenBill('PAID');
    rerender(<DispenseMedicalSupplyActions order={order} />);
    expect(screen.getByText('Ready to hand over.')).toBeInTheDocument();
  });

  it('links the order bill line to the pending dispense once the bill exists', async () => {
    givenDispenses([pending()]);
    givenBill('PENDING', { orderBill: { line_item_uuid: 'line-1' } });
    render(<DispenseMedicalSupplyActions order={order} />);

    await waitFor(() => expect(updateDispense).toHaveBeenCalledWith('dispense-1', { billReference: 'line-1' }));
    expect(updateDispense).toHaveBeenCalledTimes(1);
  });

  it('hands over and declines the undispensed remainder', async () => {
    givenDispenses([pending({ quantity: 3, billReference: 'line-1' })]);
    givenBill('PAID');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hand over' }));

    await waitFor(() => expect(updateDispense).toHaveBeenCalledWith('dispense-1', { status: 'COMPLETED' }));
    expect(createDispense).toHaveBeenCalledWith(
      expect.objectContaining({
        order: 'order-1',
        status: 'DECLINED',
        statusReason: 'reason-concept',
        comment: 'Not dispensed: 1 of 4',
      }),
    );
  });

  it('does not decline anything when the full quantity is handed over', async () => {
    givenDispenses([pending({ billReference: 'line-1' })]);
    givenBill('PAID');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hand over' }));

    await waitFor(() => expect(updateDispense).toHaveBeenCalledWith('dispense-1', { status: 'COMPLETED' }));
    expect(createDispense).not.toHaveBeenCalled();
  });

  it('opens the bill form for the dispensed quantity', async () => {
    givenDispenses([pending({ quantity: 3 })]);
    givenBill('BLANK');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Generate bill' }));

    expect(launchWorkspace2).toHaveBeenCalledWith(
      'create-order-bill-form-workspace',
      expect.objectContaining({ order, quantity: 3, serviceTypeUuid: 'service-type', servicePointName: 'NUTRITION' }),
    );
  });

  it('voids the pending dispense on cancel', async () => {
    givenDispenses([pending()]);
    givenBill('BLANK');
    render(<DispenseMedicalSupplyActions order={order} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel dispense' }));

    await waitFor(() => expect(voidDispense).toHaveBeenCalledWith('dispense-1', 'Cancelled before hand-over'));
  });
});
