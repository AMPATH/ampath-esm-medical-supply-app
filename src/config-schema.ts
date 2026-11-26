import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  commodities: {
    _type: Type.Array,
    _description:
      'One entry per commodity dashboard. The key is the URL segment, /home/<key>, and must match a dashboard link this app registers: medical-supply or nutrition.',
    _elements: {
      _type: Type.Object,
      key: { _type: Type.String, _description: 'URL segment of the dashboard, e.g. medical-supply or nutrition' },
      title: { _type: Type.String, _description: 'Name shown in the dashboard title, tiles and dialogs' },
      orderTypeUuid: { _type: Type.UUID, _description: 'Order type whose orders the dashboard lists' },
      billableServiceTypeUuid: {
        _type: Type.UUID,
        _description: 'Billable service type offered when billing a dispense',
      },
      servicePointName: { _type: Type.String, _description: 'Service point name passed to the bill form' },
    },
    _default: [
      {
        key: 'medical-supply',
        title: 'Medical supply',
        orderTypeUuid: '58ea528c-8f62-45f0-86a2-f7d1327b8c56',
        billableServiceTypeUuid: '1d11e8f7-2bd0-44b7-973a-a46a86cde97d',
        servicePointName: 'MEDICAL SUPPLY',
      },
    ],
  },
  undispensedReasonConceptUuid: {
    _type: Type.String,
    _default: '',
    _description:
      'Concept recorded as the reason when the rest of a partly dispensed order is declined. Partial dispensing is only allowed when this is set; otherwise the full ordered quantity must be dispensed.',
  },
  enableOdooBilling: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Enable Odoo billing'
  },
  blockedPaymentModes: {
    _type: Type.Array,
    _default: ['MPESA', 'CASH'],
    _description: 'Payment modes that require bill generation before picking an order',
  },
  serviceUuid: {
    _type: Type.UUID,
    _default: '2d4472e2-d7ab-4430-8e0e-a9ffcd809bf4',
    _description: 'Service Uuid for filtering queues',
  },
  patientIdIdentifierTypeUuid: {
    _type: Type.Array,
    _default: ["e88dc246-3614-4ee3-8141-1f2a83054e72", "58a47054-1359-11df-a1f1-0026b9348838"],
    _description: 'Needed if the "id" column of "labTableColumns" is used. Is the OpenMRS ID by default.',
  },
  personAttributeTypeUuid: {
    _type: Type.Array,
    _default: ['72a759a8-1359-11df-a1f1-0026b9348838'],
    _description: 'Needed for displaying person attributes',
  },
};

export interface Commodity {
  key: string;
  title: string;
  orderTypeUuid: string;
  billableServiceTypeUuid: string;
  servicePointName: string;
}

export type Config = {
  commodities: Array<Commodity>;
  undispensedReasonConceptUuid: string;
  enableOdooBilling: boolean;
  blockedPaymentModes: Array<string>;
  serviceUuid: string;
  personAttributeTypeUuid: Array<string>;
  patientIdIdentifierTypeUuid: Array<string>;
};

export const StringPath =
  "M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z";
