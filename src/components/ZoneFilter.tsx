
import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ZoneType } from '@/lib/types';
import { cn } from '@/lib/utils';

const ZoneFilter = () => {
  const selectedZoneType = useStore((state) => state.selectedZoneType);
  const setSelectedZoneType = useStore((state) => state.setSelectedZoneType);

  const zoneTypes: (ZoneType | 'all')[] = [
    'all',
    'Юрты',
    'Глэмпинг',
    'Беседки',
    'Хан-Шатыр',
    'Летний двор',
    'Террасы',
    'Тапчаны',
  ];

  const getDisplayName = (type: ZoneType | 'all') => {
    if (type === 'all') return 'Все зоны';
    return type;
  };

  return (
    <div className="mb-6 overflow-x-auto py-2">
      <div className="flex space-x-2 min-w-max">
        {zoneTypes.map((type) => (
          <Button
            key={type}
            variant={selectedZoneType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedZoneType(type)}
            className={cn(
              "whitespace-nowrap transition-all",
              selectedZoneType === type && "animate-scale-in"
            )}
          >
            {getDisplayName(type)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ZoneFilter;
