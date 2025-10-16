"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";

export interface ProductVariant {
  id?: string;
  unit: "PIECE" | "KG" | "G" | "LITER" | "ML" | "CM" | "M" | "INCH" | "OTHER";
  amount: number;
  price: number; // in paise
  originalPrice?: number; // in paise - for slashed pricing
  stock: number;
  sku?: string;
}

interface ProductVariantManagerProps {
  name?: string;
  initialVariants?: ProductVariant[];
  onChange?: (variants: ProductVariant[]) => void;
}

const UNIT_OPTIONS = [
  { value: "PIECE", label: "Piece" },
  { value: "KG", label: "Kilogram (kg)" },
  { value: "G", label: "Gram (g)" },
  { value: "LITER", label: "Liter (L)" },
  { value: "ML", label: "Milliliter (ml)" },
  { value: "CM", label: "Centimeter (cm)" },
  { value: "M", label: "Meter (m)" },
  { value: "INCH", label: "Inch" },
  { value: "OTHER", label: "Other" },
];

export default function ProductVariantManager({ 
  name = "variantsJson", 
  initialVariants = [], 
  onChange 
}: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialVariants.length > 0 
      ? initialVariants 
      : [{ unit: "PIECE", amount: 1, price: 0, stock: 0 }]
  );

  // Update variants when initialVariants changes (for edit mode)
  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(initialVariants);
    }
  }, [initialVariants]);

  // Debounce onChange calls to prevent excessive updates
  const debouncedOnChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newVariants: ProductVariant[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange?.(newVariants);
        }, 100); // 100ms debounce
      };
    })(),
    [onChange]
  );

  useEffect(() => {
    debouncedOnChange(variants);
  }, [variants, debouncedOnChange]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID for new variants
      unit: "PIECE",
      amount: 1,
      price: 0,
      originalPrice: undefined,
      stock: 0,
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    // Prevent unnecessary updates if value hasn't changed
    if (variants[index] && variants[index][field] === value) {
      return;
    }

    const updated = variants.map((variant, i) => {
      if (i === index) {
        // Ensure proper type conversion for numeric fields
        let processedValue = value;
        if (field === 'price' && typeof value === 'string') {
          processedValue = parsePrice(value);
        } else if (field === 'amount' && typeof value === 'string') {
          processedValue = parseFloat(value) || 0;
        } else if (field === 'stock' && typeof value === 'string') {
          processedValue = parseInt(value) || 0;
        }
        
        return { ...variant, [field]: processedValue };
      }
      return variant;
    });
    setVariants(updated);
  };

  const formatPrice = (priceInPaise: number) => {
    if (typeof priceInPaise !== 'number' || isNaN(priceInPaise)) {
      return '0.00';
    }
    return (priceInPaise / 100).toFixed(2);
  };

  const parsePrice = (priceString: string) => {
    if (!priceString || priceString.trim() === '') {
      return 0;
    }
    const price = parseFloat(priceString);
    if (isNaN(price) || price < 0) {
      return 0;
    }
    return Math.round(price * 100); // Convert to paise
  };


  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(variants)} readOnly />
      
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Product Variants *
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={addVariant}
          className="text-sm"
        >
          + Add Variant
        </Button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={variant.id || `variant-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Variant {index + 1}</h4>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="error"
                  onClick={() => removeVariant(index)}
                  className="text-xs px-2 py-1"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Unit */}
              <div>
                <label className="block text-xs font-medium mb-1">Unit *</label>
                <select
                  value={variant.unit}
                  onChange={(e) => updateVariant(index, 'unit', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black dark:border-gray-600"
                  required
                >
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium mb-1">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={variant.amount}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || 0;
                    if (newValue !== variant.amount) {
                      updateVariant(index, 'amount', newValue);
                    }
                  }}
                  className="text-sm"
                  placeholder="1.0"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-medium mb-1">Price (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formatPrice(variant.price)}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    // Only update if the value is different to prevent excessive re-renders
                    const currentFormatted = formatPrice(variant.price);
                    if (newValue !== currentFormatted) {
                      updateVariant(index, 'price', parsePrice(newValue));
                    }
                  }}
                  className="text-sm"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Original Price (for slashed pricing) */}
              <div>
                <label className="block text-xs font-medium mb-1">Original Price (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.originalPrice ? formatPrice(variant.originalPrice) : ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const currentFormatted = variant.originalPrice ? formatPrice(variant.originalPrice) : '';
                    if (newValue !== currentFormatted) {
                      const parsedValue = newValue === '' ? undefined : parsePrice(newValue);
                      updateVariant(index, 'originalPrice', parsedValue);
                    }
                  }}
                  className="text-sm"
                  placeholder="0.00 (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if no discount
                </p>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-medium mb-1">Stock *</label>
                <Input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    if (newValue !== variant.stock) {
                      updateVariant(index, 'stock', newValue);
                    }
                  }}
                  className="text-sm"
                  placeholder="0"
                  required
                />
              </div>

              {/* SKU Display */}
              <div>
                <label className="block text-xs font-medium mb-1">SKU</label>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border">
                  {variant.sku || "Auto-generated"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  SKU will be generated automatically
                </p>
              </div>

              {/* Display Info */}
              <div className="flex items-end">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div>Display: {variant.amount}{variant.unit.toLowerCase()}</div>
                  <div className="flex items-center gap-1">
                    {variant.originalPrice && variant.originalPrice > variant.price ? (
                      <>
                        <span className="line-through text-gray-400">₹{formatPrice(variant.originalPrice)}</span>
                        <span className="text-green-600 font-medium">₹{formatPrice(variant.price)}</span>
                      </>
                    ) : (
                      <span>Price: ₹{formatPrice(variant.price)}</span>
                    )}
                  </div>
                  <div>Stock: {variant.stock} units</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {variants.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No variants added. Click "Add Variant" to create one.</p>
        </div>
      )}

      <div className="text-xs text-gray-600 dark:text-gray-400">
        <p>* Required fields. Price is stored in paise (₹1.00 = 100 paise).</p>
        <p>SKU (Stock Keeping Unit) will be generated automatically for inventory tracking.</p>
      </div>
    </div>
  );
}
