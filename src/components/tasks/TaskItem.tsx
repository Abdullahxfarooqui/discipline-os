// Task Item Component - Individual task with completion toggle
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskDefinition, TaskCompletion } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';

interface TaskItemProps {
  task: TaskDefinition;
  completion: TaskCompletion | undefined;
  onToggle: (taskId: string, completed: boolean, value?: number) => void;
}

export function TaskItem({ task, completion, onToggle }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string>(
    completion?.value?.toString() || ''
  );
  
  const isCompleted = completion?.completed || false;
  
  const handleToggle = () => {
    if (task.requiresValue && !isCompleted) {
      setExpanded(true);
      return;
    }
    onToggle(task.id, !isCompleted);
  };
  
  const handleValueSubmit = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      onToggle(task.id, true, value);
      setExpanded(false);
    }
  };
  
  return (
    <motion.div
      layout
      className={cn(
        'rounded-lg border transition-all duration-200',
        isCompleted
          ? 'bg-safe-bg/50 border-safe-muted/30'
          : 'bg-discipline-card border-discipline-border hover:border-discipline-muted'
      )}
    >
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={handleToggle}
      >
        {/* Checkbox */}
        <motion.div
          className={cn(
            'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0',
            isCompleted
              ? 'bg-safe border-safe'
              : 'bg-transparent border-discipline-border'
          )}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Task Icon */}
        <span className="text-xl flex-shrink-0">{task.icon}</span>
        
        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-sm',
                isCompleted ? 'text-discipline-muted line-through' : 'text-white'
              )}
            >
              {task.name}
            </span>
            {task.isOptional && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary">
                Bonus
              </span>
            )}
          </div>
          <p className="text-xs text-discipline-muted truncate">
            {task.description}
          </p>
        </div>
        
        {/* Weight Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-discipline-muted">
            +{task.weight} pts
          </span>
          {task.requiresValue && !isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 hover:bg-discipline-border rounded"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-discipline-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-discipline-muted" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Value Input (for tasks requiring numeric input) */}
      <AnimatePresence>
        {expanded && task.requiresValue && !isCompleted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <div className="flex items-center gap-2 p-2 bg-discipline-dark rounded-lg">
                <Input
                  type="number"
                  placeholder={`Enter ${task.valueLabel}`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-8 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-discipline-muted whitespace-nowrap">
                  {task.valueLabel}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleValueSubmit();
                  }}
                  className="px-3 py-1.5 bg-safe text-white text-sm font-medium rounded-md hover:bg-safe/90 transition-colors"
                >
                  Log
                </motion.button>
              </div>
              {task.targetValue && (
                <p className="text-xs text-discipline-muted mt-1 px-1">
                  Target: {task.targetValue} {task.valueLabel}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Completed value display */}
      {isCompleted && completion?.value !== undefined && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex items-center gap-2 text-xs text-safe">
            <Check className="w-3 h-3" />
            <span>
              Logged: {completion.value} {task.valueLabel}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
