"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface MetadataManagerProps {
  name?: string;
  initialMeta?: Record<string, any>;
  onChange?: (meta: Record<string, any>) => void;
}

export default function MetadataManager({ 
  name = "metaJson", 
  initialMeta = {}, 
  onChange 
}: MetadataManagerProps) {
  const [metadata, setMetadata] = useState<Record<string, any>>(initialMeta || {});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  // Update local state when initialMeta changes (for edit mode)
  useEffect(() => {
    if (initialMeta && Object.keys(initialMeta).length > 0) {
      setMetadata(initialMeta);
    }
    console.log("initialMeta", initialMeta);
  }, [initialMeta]);

  useEffect(() => {
    onChange?.(metadata);
  }, [metadata, onChange]);

  const addMetadata = () => {
    if (!newKey.trim()) return;
    
    const updated = {
      ...metadata,
      [newKey.trim()]: newValue.trim() || null
    };
    setMetadata(updated);
    onChange?.(updated); // Ensure onChange is called immediately
    setNewKey("");
    setNewValue("");
  };

  const removeMetadata = (key: string) => {
    const updated = { ...metadata };
    delete updated[key];
    setMetadata(updated);
    onChange?.(updated); // Ensure onChange is called immediately
  };

  const updateMetadata = (key: string, value: string) => {
    const updated = {
      ...metadata,
      [key]: value.trim() || null
    };
    setMetadata(updated);
    onChange?.(updated); // Ensure onChange is called immediately
  };

  const commonFields = [
    { key: "brand", label: "Brand", placeholder: "e.g., Tata, Amul" },
    { key: "origin", label: "Origin", placeholder: "e.g., India, Local" },
    { key: "organic", label: "Organic", placeholder: "true/false" },
    { key: "expiry_days", label: "Shelf Life (days)", placeholder: "e.g., 30" },
    { key: "storage", label: "Storage", placeholder: "e.g., Refrigerate, Room temp" },
    { key: "nutritional_info", label: "Nutritional Info", placeholder: "e.g., High in Vitamin C" },
  ];

  const addCommonField = (key: string, label: string) => {
    if (metadata[key] !== undefined) return;
    
    const updated = {
      ...metadata,
      [key]: ""
    };
    setMetadata(updated);
    onChange?.(updated); // Ensure onChange is called immediately
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(metadata)} readOnly />
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Product Metadata (Optional)
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Add additional product information like brand, origin, storage instructions, etc.
        </p>
      </div>

      {/* Common Fields Quick Add */}
      <div>
        <h4 className="text-sm font-medium mb-2">Quick Add Common Fields:</h4>
        <div className="flex flex-wrap gap-2">
          {commonFields.map((field) => (
            <Button
              key={field.key}
              type="button"
              variant="secondary"
              onClick={() => addCommonField(field.key, field.label)}
              disabled={metadata[field.key] !== undefined}
              className="text-xs px-2 py-1"
            >
              + {field.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Existing Metadata */}
      {Object.keys(metadata).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Metadata:</h4>
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    if (newKey !== key) {
                      const updated = { ...metadata };
                      delete updated[key];
                      updated[newKey] = value;
                      setMetadata(updated);
                      onChange?.(updated); // Ensure onChange is called immediately
                    }
                  }}
                  className="text-sm"
                  placeholder="Field name"
                />
                <Input
                  type="text"
                  value={value || ""}
                  onChange={(e) => updateMetadata(key, e.target.value)}
                  className="text-sm"
                  placeholder="Field value"
                />
              </div>
              <Button
                type="button"
                variant="error"
                onClick={() => removeMetadata(key)}
                className="text-xs px-2 py-1"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Metadata */}
      <div>
        <h4 className="text-sm font-medium mb-2">Add Custom Field:</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="text-sm flex-1"
            placeholder="Field name (e.g., brand, origin)"
          />
          <Input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="text-sm flex-1"
            placeholder="Field value"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addMetadata}
            disabled={!newKey.trim()}
            className="text-sm"
          >
            Add
          </Button>
        </div>
      </div>

      {Object.keys(metadata).length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>No metadata added. Use quick add buttons or add custom fields.</p>
        </div>
      )}
    </div>
  );
}
