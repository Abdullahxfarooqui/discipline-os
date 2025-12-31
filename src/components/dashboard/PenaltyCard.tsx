// Penalty Card - Shows pending penalties
'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, Clock } from 'lucide-react';
import { Penalty } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPenaltyDisplay, getPenaltyStatusInfo } from '@/lib/engines/penaltyEngine';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface PenaltyCardProps {
  penalties: Penalty[];
  onCompletePenalty: (penaltyId: string) => void;
}

export function PenaltyCard({ penalties, onCompletePenalty }: PenaltyCardProps) {
  if (penalties.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-safe">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-medium">No Pending Penalties</p>
            <p className="text-sm text-discipline-muted">Keep up the discipline!</p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card variant="failure">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-failure">
          <AlertTriangle className="w-5 h-5" />
          Pending Penalties ({penalties.length})
        </CardTitle>
      </CardHeader>
      
      <div className="space-y-3">
        {penalties.map((penalty) => {
          const display = formatPenaltyDisplay(penalty);
          const statusInfo = getPenaltyStatusInfo(penalty.status);
          
          return (
            <motion.div
              key={penalty.id}
              layout
              className="p-3 bg-discipline-dark rounded-lg border border-failure-muted/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{display.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{display.title}</h4>
                      <Badge
                        variant={penalty.severity === 'major' ? 'failure' : 'warning'}
                        size="sm"
                      >
                        {display.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-discipline-muted mt-0.5">
                      {display.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-discipline-muted">
                      <Clock className="w-3 h-3" />
                      <span>Duration: {display.duration}</span>
                    </div>
                    <p className="text-xs text-discipline-muted mt-1">
                      Assigned: {formatDate(penalty.date)}
                    </p>
                    {penalty.editedBy === 'partner' && (
                      <p className="text-xs text-accent-primary mt-1">
                        Modified by partner
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onCompletePenalty(penalty.id)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-failure-bg/50 rounded-lg border border-failure-muted/30">
        <p className="text-sm text-failure">
          ⚠️ Penalties must be completed. No shortcuts. Face the consequence and move forward.
        </p>
      </div>
    </Card>
  );
}
