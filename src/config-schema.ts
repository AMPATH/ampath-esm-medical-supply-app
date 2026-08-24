import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  medicalSupplyOrderTypeUuid: {
    _type: Type.UUID,
    _default: "58ea528c-8f62-45f0-86a2-f7d1327b8c56",
    _description: ""
  },
  medicalSupplyServiceTypedUuid: {
    _type: Type.UUID,
    _default: '1d11e8f7-2bd0-44b7-973a-a46a86cde97d',
    _description: 'Medical supply billable service type',
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

export type Config = {
  medicalSupplyOrderTypeUuid: string;
  medicalSupplyServiceTypedUuid: string;
  enableOdooBilling: boolean;
  blockedPaymentModes: Array<string>;
  serviceUuid: string;
  personAttributeTypeUuid: Array<string>;
  patientIdIdentifierTypeUuid: Array<string>;
};

export const StringPath =
  "M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z";
