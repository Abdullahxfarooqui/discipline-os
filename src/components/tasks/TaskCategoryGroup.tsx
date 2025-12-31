// Task Category Component - Group tasks by category
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TaskDefinition, TaskCompletion, TaskCategory } from '@/types';
import { CATEGORY_INFO } from '@/lib/engines/taskEngine';
import { TaskItem } from './TaskItem';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';

interface TaskCategoryGroupProps {
  category: TaskCategory;
  tasks: TaskDefinition[];
  completions: Record<string, TaskCompletion>;
  onTaskToggle: (taskId: string, completed: boolean, value?: number) => void;
  defaultExpanded?: boolean;
}

export function TaskCategoryGroup({
  category,
  tasks,
  completions,
  onTaskToggle,
  defaultExpanded = true,
}: TaskCategoryGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const categoryInfo = CATEGORY_INFO[category];
  const completedCount = tasks.filter((t) => completions[t.id]?.completed).length;
  const completionPercent = Math.round((completedCount / tasks.length) * 100);
  
  // Determine variant based on completion
  const getVariant = () => {
    if (completionPercent === 100) return 'safe';
    if (completionPercent >= 50) return 'warning';
    return 'default';
  };
  
  return (
    <motion.div
      layout
      className="bg-discipline-card rounded-xl border border-discipline-border overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-discipline-border/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryInfo.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-white">{categoryInfo.name}</h3>
            <p className="text-xs text-discipline-muted">
              {completedCount}/{tasks.length} completed
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mini Progress */}
          <div className="w-24 hidden sm:block">
            <Progress
              value={completionPercent}
              variant={getVariant()}
            />
          </div>
          
          {/* Completion Badge */}
          <span
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              completionPercent === 100
                ? 'bg-safe-bg text-safe'
                : completionPercent >= 50
                  ? 'bg-warning-bg text-warning'
                  : 'bg-discipline-border text-discipline-muted'
            )}
          >
            {completionPercent}%
          </span>
          
          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-discipline-muted" />
          </motion.div>
        </div>
      </button>
      
      {/* Task List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  completion={completions[task.id]}
                  onToggle={onTaskToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
