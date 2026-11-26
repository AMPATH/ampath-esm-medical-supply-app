import { computeBillStatus, isBillCleared } from './order-bill-status';
import { type OrderBillResponse, type PreauthRequest } from './bill.types';
import { type BillInvoice } from '../types';

const orderBill = (overrides: Partial<OrderBillResponse> = {}): OrderBillResponse =>
  ({
    bill_uuid: 'bill-1',
    line_item_uuid: 'line-1',
    consent_token: 'consent',
    requires_preauth: false,
    intervention_code: 'INT-1',
    ...overrides,
  }) as OrderBillResponse;

const bills = (priceName: string, status: string): Array<BillInvoice> => [
  {
    uuid: 'bill-1',
    patient: { uuid: 'patient-1' },
    status: 'PENDING',
    lineItems: [{ uuid: 'line-1', priceName, status, quantity: '2', billableService: '', price: '10', item: '' }],
  },
];

const blockedPaymentModes = ['MPESA', 'CASH'];

describe('computeBillStatus', () => {
  it('is BLANK when the order has no bill line', () => {
    expect(computeBillStatus({ bills: [], blockedPaymentModes }).status).toBe('BLANK');
    expect(computeBillStatus({ orderBill: orderBill(), bills: [], blockedPaymentModes }).status).toBe('BLANK');
  });

  it('reports the real payment status for prepaid modes', () => {
    expect(computeBillStatus({ orderBill: orderBill(), bills: bills('Cash', 'PENDING'), blockedPaymentModes }).status).toBe(
      'PENDING',
    );
    const paid = computeBillStatus({ orderBill: orderBill(), bills: bills('MPESA', 'PAID'), blockedPaymentModes });
    expect(paid.status).toBe('PAID');
    expect(paid.lineItem?.quantity).toBe('2');
  });

  it('waits for a claim visit when an SHA bill has no consent token', () => {
    expect(
      computeBillStatus({ orderBill: orderBill({ consent_token: '' }), bills: bills('SHA', 'PENDING'), blockedPaymentModes })
        .status,
    ).toBe('AWAITING CLAIM VISIT');
  });

  it('clears SHA bills that need no pre-authorization', () => {
    expect(computeBillStatus({ orderBill: orderBill(), bills: bills('SHA', 'PENDING'), blockedPaymentModes }).status).toBe(
      'PAID',
    );
  });

  it('follows the pre-authorization status when one is required', () => {
    const preauth = (status: string) => [{ interventionCode: 'INT-1', status } as unknown as PreauthRequest];
    const input = { orderBill: orderBill({ requires_preauth: true }), bills: bills('SHA', 'PENDING'), blockedPaymentModes };
    expect(computeBillStatus({ ...input }).status).toBe('NEEDS PREAUTHORIZATION');
    expect(computeBillStatus({ ...input, preauthRequests: preauth('Active') }).status).toBe('PENDING PREAUTHORIZATION');
    expect(computeBillStatus({ ...input, preauthRequests: preauth('FINALISED') }).status).toBe('PAID');
    expect(computeBillStatus({ ...input, preauthRequests: preauth('REJECTED') }).status).toBe('PREAUTHORIZATION REJECTED');
  });
});

describe('isBillCleared', () => {
  it('clears only PAID and POSTED bills', () => {
    expect(isBillCleared('PAID')).toBe(true);
    expect(isBillCleared('POSTED')).toBe(true);
    expect(isBillCleared('PENDING')).toBe(false);
    expect(isBillCleared('BLANK')).toBe(false);
    expect(isBillCleared('NEEDS PREAUTHORIZATION')).toBe(false);
  });
});
