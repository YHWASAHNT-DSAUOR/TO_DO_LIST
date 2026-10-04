import React from 'react';
import * as Icons from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Sun', label: 'Morning / Sun', icon: Icons.Sun },
  { name: 'Dumbbell', label: 'Gym / Fitness', icon: Icons.Dumbbell },
  { name: 'Briefcase', label: 'Work / Business', icon: Icons.Briefcase },
  { name: 'Code', label: 'Code / Dev', icon: Icons.Code },
  { name: 'BookOpen', label: 'Study / Reading', icon: Icons.BookOpen },
  { name: 'HeartPulse', label: 'Health / Cardio', icon: Icons.HeartPulse },
  { name: 'Coffee', label: 'Break / Coffee', icon: Icons.Coffee },
  { name: 'Sparkles', label: 'Habits / Sparkles', icon: Icons.Sparkles },
  { name: 'Flame', label: 'Workout / Focus', icon: Icons.Flame },
  { name: 'Target', label: 'Goals / Target', icon: Icons.Target },
  { name: 'Home', label: 'Home / Chores', icon: Icons.Home },
  { name: 'ShoppingBag', label: 'Shopping', icon: Icons.ShoppingBag },
  { name: 'Utensils', label: 'Meals / Nutrition', icon: Icons.Utensils },
  { name: 'Music', label: 'Leisure / Music', icon: Icons.Music },
  { name: 'Brain', label: 'Mind / Deep Work', icon: Icons.Brain },
  { name: 'Laptop', label: 'Computer / Tech', icon: Icons.Laptop },
  { name: 'Zap', label: 'Urgent / Quick', icon: Icons.Zap },
  { name: 'Folder', label: 'General / Folder', icon: Icons.Folder },
];

export const getIconComponent = (iconName: string): React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }> => {
  const match = AVAILABLE_ICONS.find(i => i.name.toLowerCase() === iconName.toLowerCase());
  if (match) return match.icon;
  // Fallback icon lookup in all Lucide exports
  const directLookup = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>>)[iconName];
  if (directLookup) return directLookup;
  return Icons.Folder;
};

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon }) => {
  return (
    <div className="icon-picker-grid">
      {AVAILABLE_ICONS.map(({ name, label, icon: IconComponent }) => {
        const isSelected = selectedIcon.toLowerCase() === name.toLowerCase();
        return (
          <button
            key={name}
            type="button"
            className={`icon-picker-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectIcon(name)}
            title={label}
            aria-label={label}
          >
            <IconComponent size={20} />
          </button>
        );
      })}
    </div>
  );
};
