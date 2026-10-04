import React from 'react';

export const ACCENT_COLORS = [
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#0EA5E9', name: 'Sky' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EF4444', name: 'Rose' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#64748B', name: 'Slate' },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="color-picker-palette">
      {ACCENT_COLORS.map(c => {
        const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
        return (
          <button
            key={c.hex}
            type="button"
            className={`color-swatch-button ${isSelected ? 'selected' : ''}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => onSelectColor(c.hex)}
            title={c.name}
            aria-label={c.name}
          >
            {isSelected && <span className="color-swatch-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
};
