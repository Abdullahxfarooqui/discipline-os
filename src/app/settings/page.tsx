// Settings Page
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Clock,
  Target,
  Activity,
  Droplets,
  Save,
  LogOut,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { signOutUser } from '@/lib/firebase/auth';
import { updateUserProfile } from '@/lib/firebase/database';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface SettingsForm {
  displayName: string;
  fajrTime: string;
  targetSleepTime: string;
  targetWakeTime: string;
  dailyCalorieTarget: number;
  dailyStepsTarget: number;
  dailyWaterTarget: number;
  notifyMorning: boolean;
  notifyEvening: boolean;
  notifyReminders: boolean;
  notifyPartner: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile, setUser, setUserProfile } = useAppStore();
  
  const [form, setForm] = useState<SettingsForm>({
    displayName: '',
    fajrTime: '05:30',
    targetSleepTime: '22:30',
    targetWakeTime: '05:00',
    dailyCalorieTarget: 2000,
    dailyStepsTarget: 10000,
    dailyWaterTarget: 8,
    notifyMorning: true,
    notifyEvening: true,
    notifyReminders: true,
    notifyPartner: true,
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Initialize form from profile
  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        fajrTime: userProfile.settings?.fajrTime || '05:30',
        targetSleepTime: userProfile.settings?.targetSleepTime || '22:30',
        targetWakeTime: userProfile.settings?.targetWakeTime || '05:00',
        dailyCalorieTarget: userProfile.settings?.dailyCalorieTarget || 2000,
        dailyStepsTarget: userProfile.settings?.dailyStepsTarget || 10000,
        dailyWaterTarget: userProfile.settings?.dailyWaterTarget || 8,
        notifyMorning: userProfile.settings?.notifications?.morning ?? true,
        notifyEvening: userProfile.settings?.notifications?.evening ?? true,
        notifyReminders: userProfile.settings?.notifications?.reminders ?? true,
        notifyPartner: userProfile.settings?.notifications?.partnerUpdates ?? true,
      });
    }
  }, [userProfile]);
  
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const updates: Partial<UserProfile> = {
        displayName: form.displayName,
        settings: {
          sleepTarget: userProfile?.settings?.sleepTarget || '22:30',
          screenTimeLimit: userProfile?.settings?.screenTimeLimit || 180,
          fajrTime: form.fajrTime,
          targetSleepTime: form.targetSleepTime,
          targetWakeTime: form.targetWakeTime,
          dailyCalorieTarget: form.dailyCalorieTarget,
          dailyStepsTarget: form.dailyStepsTarget,
          dailyWaterTarget: form.dailyWaterTarget,
          notifications: {
            morning: form.notifyMorning,
            evening: form.notifyEvening,
            reminders: form.notifyReminders,
            partnerUpdates: form.notifyPartner,
          },
        },
      };
      
      await updateUserProfile(user.uid, updates);
      setUserProfile({ ...userProfile!, ...updates });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };
  
  const updateForm = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="min-h-screen bg-discipline-darker">
      <Navigation />
      
      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-discipline-muted" />
              Settings
            </h1>
            <p className="text-discipline-muted mt-1">
              Configure your discipline parameters
            </p>
          </motion.div>
          
          {/* Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Display Name"
                value={form.displayName}
                onChange={(e) => updateForm('displayName', e.target.value)}
                placeholder="Your name"
              />
              
              <div className="flex items-center gap-2 text-sm text-discipline-muted">
                <span>Email:</span>
                <span className="text-white">{user?.email || 'Not signed in'}</span>
              </div>
              
              {userProfile && (
                <div className="flex items-center gap-3 pt-2">
                  <Badge variant="accent">
                    Level {userProfile.level || 1}
                  </Badge>
                  <Badge variant="safe">
                    🔥 {userProfile.streak?.current || 0} day streak
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Schedule Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fajr Prayer Time"
                  type="time"
                  value={form.fajrTime}
                  onChange={(e) => updateForm('fajrTime', e.target.value)}
                />
                
                <Input
                  label="Target Wake Time"
                  type="time"
                  value={form.targetWakeTime}
                  onChange={(e) => updateForm('targetWakeTime', e.target.value)}
                />
                
                <Input
                  label="Target Sleep Time"
                  type="time"
                  value={form.targetSleepTime}
                  onChange={(e) => updateForm('targetSleepTime', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Targets Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Daily Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Daily Calories"
                  type="number"
                  value={form.dailyCalorieTarget}
                  onChange={(e) => updateForm('dailyCalorieTarget', parseInt(e.target.value) || 0)}
                />
                
                <Input
                  label="Daily Steps"
                  type="number"
                  value={form.dailyStepsTarget}
                  onChange={(e) => updateForm('dailyStepsTarget', parseInt(e.target.value) || 0)}
                />
                
                <Input
                  label="Water (glasses)"
                  type="number"
                  value={form.dailyWaterTarget}
                  onChange={(e) => updateForm('dailyWaterTarget', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Checkbox
                label="Morning Briefing"
                description="Daily task reminder at 6 AM"
                checked={form.notifyMorning}
                onChange={(e) => updateForm('notifyMorning', e.target.checked)}
              />
              
              <Checkbox
                label="Evening Review"
                description="Reminder to complete tasks at 9 PM"
                checked={form.notifyEvening}
                onChange={(e) => updateForm('notifyEvening', e.target.checked)}
              />
              
              <Checkbox
                label="Task Reminders"
                description="Individual reminders for pending tasks"
                checked={form.notifyReminders}
                onChange={(e) => updateForm('notifyReminders', e.target.checked)}
              />
              
              <Checkbox
                label="Partner Updates"
                description="Notifications when your partner completes tasks"
                checked={form.notifyPartner}
                onChange={(e) => updateForm('notifyPartner', e.target.checked)}
              />
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-failure hover:text-failure w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          {/* Version Info */}
          <div className="mt-8 pt-6 border-t border-discipline-dark text-center text-xs text-discipline-muted">
            <p>Discipline OS v1.0.0</p>
            <p className="mt-1">Built with discipline, enforced with consequences</p>
          </div>
        </div>
      </main>
    </div>
  );
}
