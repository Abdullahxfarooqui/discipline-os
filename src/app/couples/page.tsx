// Couples Accountability Circle Page
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  Crown,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Send,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CouplesCircle, Penalty } from '@/types';
import {
  createCouplesCircle,
  joinCouplesCircle,
  leaveCouplesCircle,
  getCouplesCircle,
  getDailyRecord,
} from '@/lib/firebase/database';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CouplesPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [circleName, setCircleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [partnerRecord, setPartnerRecord] = useState<any>(null);
  
  const { user, userProfile, couplesCircle, setCouplesCircle } = useAppStore();
  
  // Load partner's record if in a circle
  useEffect(() => {
    async function loadPartnerData() {
      if (!couplesCircle || !user) return;
      
      const partnerId = couplesCircle.members.find((id) => id !== user.uid);
      if (!partnerId) return;
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const record = await getDailyRecord(partnerId, today);
        setPartnerRecord(record);
      } catch (error) {
        console.error('Failed to load partner record:', error);
      }
    }
    
    loadPartnerData();
  }, [couplesCircle, user]);
  
  const handleCreateCircle = async () => {
    if (!user || !circleName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const circleId = await createCouplesCircle(user.uid, circleName);
      const circle = await getCouplesCircle(circleId);
      if (circle) {
        setCouplesCircle(circle);
      }
      setShowCreateModal(false);
      setCircleName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinCircle = async () => {
    if (!user || !joinCode.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const circleId = await joinCouplesCircle(user.uid, joinCode.toUpperCase());
      const circle = await getCouplesCircle(circleId);
      if (circle) {
        setCouplesCircle(circle);
      }
      setShowJoinModal(false);
      setJoinCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to join circle');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeaveCircle = async () => {
    if (!user || !couplesCircle) return;
    
    if (!confirm('Are you sure you want to leave this circle? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await leaveCouplesCircle(user.uid, couplesCircle.id);
      setCouplesCircle(null);
    } catch (err: any) {
      setError(err.message || 'Failed to leave circle');
    } finally {
      setLoading(false);
    }
  };
  
  const copyInviteCode = () => {
    if (couplesCircle?.inviteCode) {
      navigator.clipboard.writeText(couplesCircle.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safe';
      case 'warning': return 'text-warning';
      case 'failure': return 'text-failure';
      default: return 'text-discipline-muted';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe': return <Badge variant="safe">Safe</Badge>;
      case 'warning': return <Badge variant="warning">At Risk</Badge>;
      case 'failure': return <Badge variant="failure">Failed</Badge>;
      default: return <Badge variant="muted">No Data</Badge>;
    }
  };
  
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
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-failure" />
              Couples Circle
            </h1>
            <p className="text-discipline-muted mt-1">
              Mutual accountability for growth together
            </p>
          </motion.div>
          
          {!couplesCircle ? (
            // No Circle - Show options
            <div className="space-y-6">
              <Card className="text-center py-12">
                <Users className="w-16 h-16 text-discipline-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  You&apos;re not in an accountability circle yet
                </h2>
                <p className="text-discipline-muted mb-6 max-w-md mx-auto">
                  Create a circle and invite your partner, or join an existing one
                  using an invite code.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Create Circle
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowJoinModal(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Circle
                  </Button>
                </div>
              </Card>
              
              {/* Info Card */}
              <Card className="border-accent-primary/20">
                <h3 className="font-semibold text-white mb-3">How Couples Circles Work</h3>
                <ul className="space-y-2 text-sm text-discipline-muted">
                  <li className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-accent-primary mt-0.5" />
                    <span>View each other&apos;s daily progress and completion rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Edit2 className="w-4 h-4 text-accent-primary mt-0.5" />
                    <span>Edit or assign penalties to each other when needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-primary mt-0.5" />
                    <span>Get notified when your partner is falling behind</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-accent-primary mt-0.5" />
                    <span>Celebrate milestones and streaks together</span>
                  </li>
                </ul>
              </Card>
            </div>
          ) : (
            // In a Circle - Show dashboard
            <div className="space-y-6">
              {/* Circle Info Card */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{couplesCircle.name || 'Our Circle'}</h2>
                      <p className="text-sm text-discipline-muted">
                        {couplesCircle.members.length === 1 ? 'Waiting for partner' : '2 members'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLeaveCircle}
                    className="text-failure hover:text-failure"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Leave
                  </Button>
                </div>
                
                {/* Invite Code */}
                {couplesCircle.members.length === 1 && (
                  <div className="bg-discipline-dark/50 rounded-lg p-4">
                    <p className="text-sm text-discipline-muted mb-2">Share this code with your partner:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-discipline-darker px-4 py-2 rounded font-mono text-lg text-accent-primary">
                        {couplesCircle.inviteCode}
                      </code>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyInviteCode}
                      >
                        {copiedCode ? (
                          <CheckCircle className="w-4 h-4 text-safe" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
              
              {/* Partner Progress (if 2 members) */}
              {couplesCircle.members.length === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Partner&apos;s Progress Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {partnerRecord ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CircularProgress
                              value={partnerRecord.completionPercentage}
                              variant={
                                partnerRecord.status === 'safe' ? 'safe' :
                                partnerRecord.status === 'warning' ? 'warning' : 'failure'
                              }
                            />
                            <div>
                              <p className={cn(
                                'text-2xl font-bold',
                                getStatusColor(partnerRecord.status)
                              )}>
                                {partnerRecord.completionPercentage}%
                              </p>
                              <p className="text-sm text-discipline-muted">Completion</p>
                            </div>
                          </div>
                          {getStatusBadge(partnerRecord.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-discipline-dark">
                          <div>
                            <p className="text-2xl font-bold text-safe">{partnerRecord.totalPoints}</p>
                            <p className="text-sm text-discipline-muted">Points Earned</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {Object.values(partnerRecord.tasks).filter((t: any) => t.completed).length}
                            </p>
                            <p className="text-sm text-discipline-muted">Tasks Done</p>
                          </div>
                        </div>
                        
                        {partnerRecord.status === 'failure' && (
                          <div className="bg-failure/10 border border-failure/20 rounded-lg p-3 mt-4">
                            <div className="flex items-center gap-2 text-failure">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Partner needs support today
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-discipline-muted">
                        <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No data for today yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Shared Stats */}
              {couplesCircle.members.length === 2 && (
                <Card variant="safe">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-failure" />
                    <h3 className="font-semibold text-white">Circle Stats</h3>
                  </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-safe">
                        {couplesCircle.sharedStreak || 0}
                      </p>
                      <p className="text-xs text-discipline-muted">Shared Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {Math.floor((Date.now() - new Date(couplesCircle.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-discipline-muted">Days Together</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent-primary">
                        {couplesCircle.mutualChallenges?.filter((c: { completed: boolean }) => c.completed).length || 0}
                      </p>
                      <p className="text-xs text-discipline-muted">Challenges Won</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError(null);
        }}
        title="Join a Circle"
      >
        <div className="space-y-4">
          <p className="text-discipline-muted">
            Enter the invite code shared by your partner to join their circle.
          </p>
          <Input
            label="Invite Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC123"
            maxLength={6}
          />
          {error && (
            <p className="text-sm text-failure">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleJoinCircle}
              disabled={loading || joinCode.length < 6}
            >
              {loading ? 'Joining...' : 'Join Circle'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError(null);
        }}
        title="Create a Circle"
      >
        <div className="space-y-4">
          <p className="text-discipline-muted">
            Give your circle a name. You&apos;ll get an invite code to share with your partner.
          </p>
          <Input
            label="Circle Name"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
            placeholder="e.g. Our Growth Journey"
          />
          {error && (
            <p className="text-sm text-failure">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCircle}
              disabled={loading || !circleName.trim()}
            >
              {loading ? 'Creating...' : 'Create Circle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
