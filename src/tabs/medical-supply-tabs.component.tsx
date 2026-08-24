import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { Extension, useAssignedExtensions } from '@openmrs/esm-framework';
// ComponentContext is not part of the public API but is needed here to render extensions
// inside Carbon Tabs structure (TabList + TabPanels must be separate siblings).
// eslint-disable-next-line no-restricted-imports
import { ComponentContext } from '@openmrs/esm-framework/src/internal';
import { type Config } from '../config-schema';
import styles from './medical-supply-tabs.scss';

const panelSlot = 'medical-supply-panels-slot';

const MedicalSupplyOrdersTabs: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const tabExtensions = useAssignedExtensions(panelSlot);

  const filteredExtensions = tabExtensions.filter((extension) => {
    const meta = extension.meta ?? {};
    if (Object.keys(meta).length === 0) {
      return false;
    }
    return true;
  });

  return (
    <main>
      <section>
        <div className={styles.tabs}>
          <Tabs selectedIndex={selectedTab} onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
            <TabList aria-label="Medical supply tabs" contained>
              {filteredExtensions.map((extension) => {
                const { name, title } = extension.meta ?? {};

                if (name && title) {
                  return (
                    <Tab key={extension.id} className={styles.tab} id={`${extension.id}-tab`}>
                      {t(title, {
                        ns: extension.moduleName,
                        defaultValue: title,
                      })}
                    </Tab>
                  );
                } else {
                  return null;
                }
              })}
            </TabList>
            <TabPanels>
              {filteredExtensions.map((extension) => (
                <TabPanel key={extension.id}>
                  <ComponentContext.Provider
                    key={extension.id}
                    value={{
                      moduleName: extension.moduleName,
                      featureName: 'medical-supply',
                      extension: {
                        extensionId: extension.id,
                        extensionSlotName: panelSlot,
                        extensionSlotModuleName: extension.moduleName,
                      },
                    }}
                  >
                    <Extension />
                  </ComponentContext.Provider>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </section>
    </main>
  );
};

export default MedicalSupplyOrdersTabs;
