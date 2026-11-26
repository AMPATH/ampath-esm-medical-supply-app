import { useConfig } from '@openmrs/esm-framework';
import { renderHook } from '@testing-library/react';
import { commodityKeyFromPath, commodityNoun, useCommodity } from './commodity';

const commodities = [
  { key: 'medical-supply', title: 'Medical supply', orderTypeUuid: 'ms', billableServiceTypeUuid: 's1', servicePointName: 'MEDICAL SUPPLY' },
  { key: 'nutrition', title: 'Nutrition', orderTypeUuid: 'nu', billableServiceTypeUuid: 's2', servicePointName: 'NUTRITION' },
];

describe('commodityKeyFromPath', () => {
  it('reads the dashboard key after /home/', () => {
    expect(commodityKeyFromPath('/openmrs/spa/home/nutrition')).toBe('nutrition');
    expect(commodityKeyFromPath('/openmrs/spa/home/medical-supply/anything')).toBe('medical-supply');
  });

  it('is undefined outside a home dashboard', () => {
    expect(commodityKeyFromPath('/openmrs/spa/patient/123/chart')).toBeUndefined();
  });
});

describe('useCommodity', () => {
  beforeEach(() => {
    jest.mocked(useConfig).mockReturnValue({ commodities });
  });

  it('returns the configured commodity for the open dashboard', () => {
    window.history.pushState({}, '', '/openmrs/spa/home/nutrition');
    const { result } = renderHook(() => useCommodity());
    expect(result.current?.orderTypeUuid).toBe('nu');
  });

  it('is undefined for a dashboard with no config entry', () => {
    window.history.pushState({}, '', '/openmrs/spa/home/blood-products');
    const { result } = renderHook(() => useCommodity());
    expect(result.current).toBeUndefined();
  });
});

describe('commodityNoun', () => {
  it('lower-cases the title for use in a sentence', () => {
    expect(commodityNoun(commodities[0])).toBe('medical supply');
    expect(commodityNoun(undefined)).toBe('');
  });
});
