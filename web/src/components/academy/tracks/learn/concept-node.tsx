import React from 'react';
import { Card } from '@/components/ui/card';

interface ConceptNodeProps {
  label: string;
  id?: string;
}

export function ConceptNode({ label, id }: ConceptNodeProps) {
  // Compute a 2-letter abbreviation
  const abbr = label 
    ? label.substring(0, 2).charAt(0).toUpperCase() + label.substring(1, 2).toLowerCase() 
    : 'Un';

  return (
    <Card id={id} className="w-fit flex flex-row items-center gap-4 py-5 px-12 transition-all duration-200 hover:border-primary/50">
      <div className="pr-1">
        <h3 className="text-xl font-semibold text-foreground whitespace-nowrap">{label}</h3>
      </div>
    </Card>
  );
}
