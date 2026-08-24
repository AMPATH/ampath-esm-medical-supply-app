import React from 'react';
import styles from './root.scss';
import MedicalSupplyDashboard from './medical-supply-dashboard.component';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Root: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/home/medical-supply`}>
      <Routes>
        <Route path="/" element={<MedicalSupplyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
