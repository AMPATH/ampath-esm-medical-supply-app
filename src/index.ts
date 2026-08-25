/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from './createDashboardLink';

const moduleName = '@ampath/ampath-esm-medical-supply-app';

const options = {
  featureName: 'medical-supply',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const medicalSupplyDashboardLink = getSyncLifecycle(createDashboardLink({ name: 'medical-supply', title: 'Medical Supply' }), options);

// Actions
export const pickupMedicalSupplyRequestAction = getAsyncLifecycle(
  () => import('./actions/pickup-medical-supply-request-action.component'),
  options,
);

export const dispenseMedicalSupplyRequestAction = getAsyncLifecycle(
  () => import('./actions/dispense-medical-supply-request-action.component'),
  options,
);

export const rejectMedicalSupplyRequestAction = getAsyncLifecycle(
  () => import('./actions/reject-medical-supply-request-action.component'),
  options,
);

export const generateBillRequestAction = getAsyncLifecycle(
  () => import('./actions/generate-bill-request-action.component'),
  options,
);

// Modals
export const pickupMedicalSupplyRequestModal = getAsyncLifecycle(
  () => import('./modals/pickup-medical-supply-request-modal.component'),
  options,
);

export const dispenseMedicalSupplyRequestModal = getAsyncLifecycle(
  () => import('./modals/dispense-medical-supply-request-modal.component'),
  options,
);

export const rejectMedicalSupplyRequestModal = getAsyncLifecycle(
  () => import('./modals/reject-medical-supply-request-modal.component'),
  options,
);

// Workspaces
export const postMedicalSupplyForm = getAsyncLifecycle(
  () => import('./forms/post-medical-supply/post-medical-supply-form.component'),
  options,
);

// Tables
export const orderedRequestsTable = getAsyncLifecycle(
  () => import('./data-table-extensions/ordered-requests-table.extension'),
  options,
);

export const completedRequestsTable = getAsyncLifecycle(
  () => import('./data-table-extensions/completed-requests-table.extension'),
  options,
);

export const declinedRequestsTable = getAsyncLifecycle(
  () => import('./data-table-extensions/declined-requests-table-extension'),
  options,
);

// Tiles
export const declinedRequestsTile = getAsyncLifecycle(
  () => import('./summary/tiles/declined-requests-tile.component'),
  options,
);

export const completedRequestsTile = getAsyncLifecycle(
  () => import('./summary/tiles/completed-requests-tile.component'),
  options,
);

export const orderedRequestsTile = getAsyncLifecycle(() => import('./summary/tiles/ordered-requests-tile.component'), options);