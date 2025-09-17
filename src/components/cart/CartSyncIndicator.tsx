'use client';

import { useCart } from '@/hooks/useCart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const CartSyncIndicator = () => {
  const { syncStatus, isRetrying } = useCart();

  if (syncStatus === 'idle') {
    return null;
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing cart...';
      case 'retrying':
        return 'Retrying sync...';
      case 'error':
        return 'Sync failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
      case 'retrying':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-50 rounded-md">
      {(syncStatus === 'syncing' || isRetrying) && (
        <LoadingSpinner size="sm" />
      )}
      {syncStatus === 'error' && (
        <div className="w-2 h-2 bg-red-500 rounded-full" />
      )}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
    </div>
  );
};
