import React, { createContext, useContext, useState, ReactNode } from 'react';

export type VectorRecord = {
  fileId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
  vector: Float32Array;
};

type VectorContextType = {
  vectors: VectorRecord[];
  addVectors: (newVectors: VectorRecord[]) => void;
  clearVectors: () => void;
};

const VectorContext = createContext<VectorContextType | undefined>(undefined);

export const VectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vectors, setVectors] = useState<VectorRecord[]>([]);

  const addVectors = (newVectors: VectorRecord[]) => {
    setVectors(prev => [...prev, ...newVectors]);
  };

  const clearVectors = () => {
    setVectors([]);
  };

  return (
    <VectorContext.Provider value={{ vectors, addVectors, clearVectors }}>
      {children}
    </VectorContext.Provider>
  );
};

export const useVectors = () => {
  const context = useContext(VectorContext);
  if (context === undefined) {
    throw new Error('useVectors must be used within a VectorProvider');
  }
  return context;
};
