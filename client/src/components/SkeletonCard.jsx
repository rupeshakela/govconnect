import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel" style={{ borderRadius: '12px', padding: '20px', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="skeleton" style={{ width: '80px', height: '20px', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
        <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ width: '90%', height: '14px' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '8px' }}></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
