// Daily Tasks List - Full task list for the day
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DailyRecord, TaskCategory } from '@/types';
import { getTasksGroupedByCategory, getMandatoryTasks, getOptionalTasks } from '@/lib/engines/taskEngine';
import { TaskCategoryGroup } from './TaskCategoryGroup';

interface DailyTasksListProps {
  record: DailyRecord;
  onTaskToggle: (taskId: string, completed: boolean, value?: number) => void;
}

const categoryOrder: TaskCategory[] = [
  'deen',
  'health',
  'sleep',
  'nutrition',
  'productivity',
  'mental',
  'digital',
  'deen_upgrade',
];

export function DailyTasksList({ record, onTaskToggle }: DailyTasksListProps) {
  const groupedTasks = useMemo(() => getTasksGroupedByCategory(), []);
  
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {categoryOrder.map((category) => {
        const tasks = groupedTasks[category];
        if (!tasks || tasks.length === 0) return null;
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TaskCategoryGroup
              category={category}
              tasks={tasks}
              completions={record.tasks}
              onTaskToggle={onTaskToggle}
              defaultExpanded={category !== 'deen_upgrade'}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
