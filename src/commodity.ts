import { useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type Commodity, type Config } from './config-schema';

export type { Commodity };

/** App context holding the dashboard's date range filter. */
export const DATE_FILTER_CONTEXT = 'commodity-orders-date-filter';

/** The key of the commodity dashboard in a home URL, e.g. "nutrition" in /spa/home/nutrition/... */
export function commodityKeyFromPath(pathname: string = window.location.pathname): string | undefined {
  const match = pathname.match(/\/home\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * The commodity whose dashboard is open, from the URL (/home/<key>) and the commodities config.
 * The URL is the one source every part of the dashboard can read: tabs, tiles, actions and modals
 * render as separate extensions, so React context from the dashboard does not reach them.
 */
export function useCommodity(): Commodity | undefined {
  const { commodities } = useConfig<Config>();
  const key = commodityKeyFromPath();
  return useMemo(() => commodities?.find((commodity) => commodity.key === key), [commodities, key]);
}

/** The commodity's title for use inside a sentence ("Dispense nutrition"). */
export function commodityNoun(commodity: Commodity | undefined): string {
  return commodity?.title?.toLowerCase() ?? '';
}
