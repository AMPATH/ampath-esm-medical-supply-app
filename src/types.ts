import { type Order as FrameworkOrder, type OrderUrgency } from '@openmrs/esm-framework';

type FrameworkFulfillerStatus = FrameworkOrder['fulfillerStatus'];
export type FulfillerStatus = FrameworkFulfillerStatus | 'DRAFT' | null;

export type Order = Omit<FrameworkOrder, 'fulfillerStatus' | 'fulfillerComment'> & {
  fulfillerStatus?: FulfillerStatus;
  fulfillerComment?: string | null;
};

export interface FlattenedOrder {
  id: string;
  patientUuid: string;
  orderNumber: string;
  display: string;
  dateActivated: string;
  fulfillerStatus: FulfillerStatus;
  urgency: OrderUrgency;
  orderer?: string;
  instructions?: string;
  fulfillerComment?: string;
}

export interface GroupedOrders {
  patientUuid: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientDob?: string;
  patientSex?: string;
  totalOrders: number;
  orders: Array<FlattenedOrder>;
  originalOrders: Array<Order>;
}

export type DateFilterContext = {
  dateRange: [Date, Date] | null;
  setDateRange: React.Dispatch<React.SetStateAction<[Date, Date] | null>>;
};

export type CodedCondition = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

export type CodedProvider = {
  uuid: string;
  display: string;
};

export type BillStatus = 'BLANK' | 'PENDING' | 'PAID' | 'POSTED' | 'PENDING PREAUTHORIZATION' | 'NEEDS PREAUTHORIZATION' | 'AWAITING CLAIM VISIT' | 'PREAUTHORIZATION REJECTED';

export interface LineItem {
  uuid: string;
  billableService: string;
  quantity: string;
  price: string;
  item: string;
  priceName: string;
  status: string;
}
export interface BillInvoice {
  uuid: string;
  patient: {
    uuid: string;
  };
  lineItems: LineItem[];
  status: string;
}

export type QueueEntryResult = {
  name: string;
  queue_entry_id: number;
  priority_comment: string;
  wait_time_in_min: number;
  service_uuid: string;
  location_id: number;
  location: string;
  service: number;
  queue_id: number;
  queue_room: string;
  priority: string;
  patient_id: number;
  visit_id: number;
  patient_uuid: string;
  family_name: string;
  given_name: string;
  middle_name: string;
  status: string;
  visit_uuid: string;
  queue_coming_from: string;
  bill_status: string;
  bill_item_payment_status: string;
  price_name: string;
  cash_unpaid_client: string;
  hide_in_queue: number;
  identifiers: string;
  phone_number: string;
};