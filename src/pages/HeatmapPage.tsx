import React from 'react';
import HeatmapViewer from '../components/HeatmapViewer';

export const HeatmapPage: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      <HeatmapViewer />
    </div>
  );
};
