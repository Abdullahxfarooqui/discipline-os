// Tasks Page - Full task management view
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, CheckSquare, Clock, Trophy } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Navigation } from '@/components/layout/Navigation';
import { DailyTasksList } from '@/components/tasks';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { TaskCategory } from '@/types';
import { CATEGORY_INFO, getMandatoryTasks, getOptionalTasks } from '@/lib/engines/taskEngine';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'pending' | 'completed' | TaskCategory;

export default function TasksPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { todayRecord, updateTaskCompletion } = useAppStore();
  
  const handleTaskToggle = async (taskId: string, completed: boolean, value?: number) => {
    await updateTaskCompletion(taskId, completed, value);
    if (completed) {
      toast.success('Task completed!', { icon: '✅' });
    }
  };
  
  // Calculate stats
  const stats = useMemo(() => {
    if (!todayRecord) return { completed: 0, pending: 0, total: 0, percentage: 0 };
    
    const tasks = Object.values(todayRecord.tasks);
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    
    return {
      completed,
      pending: total - completed,
      total,
      percentage: todayRecord.completionPercentage,
    };
  }, [todayRecord]);
  
  if (!todayRecord) {
    return (
      <div className="min-h-screen bg-discipline-darker flex items-center justify-center">
        <div className="animate-pulse text-discipline-muted">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-discipline-darker">
      <Navigation />
      
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">Tasks</h1>
            <p className="text-discipline-muted mt-1">
              Track your daily compliance across all domains
            </p>
          </motion.div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card animate={false} className="text-center">
              <CheckSquare className="w-5 h-5 text-safe mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-discipline-muted">Completed</p>
            </Card>
            <Card animate={false} className="text-center">
              <Clock className="w-5 h-5 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-discipline-muted">Pending</p>
            </Card>
            <Card animate={false} className="text-center">
              <Trophy className="w-5 h-5 text-accent-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-discipline-muted">Total Tasks</p>
            </Card>
            <Card animate={false} className="text-center">
              <div className="w-5 h-5 mx-auto mb-2">
                <Progress
                  value={stats.percentage}
                  variant={stats.percentage >= 65 ? 'safe' : stats.percentage >= 50 ? 'warning' : 'failure'}
                />
              </div>
              <p className="text-2xl font-bold text-white">{stats.percentage}%</p>
              <p className="text-xs text-discipline-muted">Complete</p>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            
            <div className="hidden md:flex items-center gap-2 ml-auto">
              {Object.entries(CATEGORY_INFO).slice(0, 4).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as TaskCategory)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    filter === key
                      ? 'bg-accent-primary text-white'
                      : 'bg-discipline-card text-discipline-muted hover:text-white'
                  )}
                >
                  {info.icon} {info.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Task List */}
          <DailyTasksList
            record={todayRecord}
            onTaskToggle={handleTaskToggle}
          />
          
          {/* Motivation Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-discipline-card rounded-xl border border-discipline-border text-center"
          >
            <p className="text-lg text-white italic">
              "Discipline is choosing between what you want now and what you want most."
            </p>
            <p className="text-sm text-discipline-muted mt-2">— Abraham Lincoln</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
