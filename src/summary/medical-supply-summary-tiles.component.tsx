import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AssignedExtension, useAssignedExtensions, Extension } from '@openmrs/esm-framework';
// ComponentContext is not part of the public API but is needed here to render extensions
// in a custom layout (CSS grid tiles) without the wrapper div that ExtensionSlot adds.
// eslint-disable-next-line no-restricted-imports
import { ComponentContext } from '@openmrs/esm-framework/src/internal';
import styles from './medical-supply-summary-tiles.scss';

const MedicalSupplySummaryTiles: React.FC = () => {
  const tileSlot = 'medical-supply-tiles-slot';
  const tilesExtensions = useAssignedExtensions(tileSlot) as AssignedExtension[];

  const filteredExtensions = tilesExtensions.filter((extension) => {
    const meta = extension.meta ?? {};
    if (Object.keys(meta).length === 0) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.cardContainer}>
      {filteredExtensions.map((extension, index) => {
        return (
          <ComponentContext.Provider
            key={extension.id}
            value={{
              moduleName: extension.moduleName,
              featureName: 'medical-supply',
              extension: {
                extensionId: extension.id,
                extensionSlotName: tileSlot,
                extensionSlotModuleName: extension.moduleName,
              },
            }}
          >
            <Extension />
          </ComponentContext.Provider>
        );
      })}
    </div>
  );
};

export default MedicalSupplySummaryTiles;
