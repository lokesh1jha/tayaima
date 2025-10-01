'use client';

import { useState } from 'react';
import { IconX, IconAlertTriangle, IconShoppingBag } from '@tabler/icons-react';
import Button from './Button';
import Input from './Input';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  orderId: string;
  orderTotal: number;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  orderTotal,
  isLoading = false,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <IconAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{orderId}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
          >
            <IconX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IconAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Are you sure you want to cancel this order?
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  This action cannot be undone. Your payment will be refunded if applicable.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <IconShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Order Total
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{(orderTotal / 100).toFixed(2)}
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cancellation Reason (Optional)
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're cancelling this order..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 resize-none"
              rows={3}
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {reason.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Keep Order
          </Button>
          <Button
            variant="error"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelling...
              </div>
            ) : (
              'Cancel Order'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
