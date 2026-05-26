'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Heart,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Users,
  Key,
  ToggleLeft,
  ToggleRight,
  X,
  Crown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Modal, Input, Avatar, Badge, Loading } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// ========== 子组件：设置项卡片 ==========
interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  rightContent?: React.ReactNode;
}

function SettingCard({ icon, title, description, onClick, rightContent }: SettingCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl bg-white shadow-soft border border-waibao-pink-light/20 transition-all',
        onClick && 'cursor-pointer hover:shadow-soft-lg hover:-translate-y-0.5'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-waibao-pink-light flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-waibao-text">{title}</p>
        {description && (
          <p className="text-xs text-waibao-text-light mt-0.5 truncate">{description}</p>
        )}
      </div>
      {rightContent || (
        <ChevronRight className="w-5 h-5 text-waibao-text-light/40 shrink-0" />
      )}
    </div>
  );
}

// ========== Toggle 开关 ==========
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors shrink-0',
        checked ? 'bg-waibao-primary' : 'bg-gray-200'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

// ========== 子组件：情侣绑定卡片 ==========
function CoupleBinding() {
  const { user } = useAuth();
  const [coupleStatus, setCoupleStatus] = useState<{
    status: string;
    bindCode?: string;
    partner?: { nickname: string; avatar: string | null };
    loveStartDate?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupleStatus();
  }, []);

  const fetchCoupleStatus = async () => {
    try {
      const res = await fetch('/api/couples/status');
      const data = await res.json();
      if (data.success) {
        setCoupleStatus(data.data);
      }
    } catch {
      // 静默
    } finally {
      setLoading(false);
    }
  };

  const handleUnbind = async () => {
    if (!confirm('确定要解除情侣绑定吗？')) return;
    try {
      const res = await fetch('/api/couples/unbind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('已解除绑定');
        fetchCoupleStatus();
      } else {
        toast.error(data.error || '解绑失败');
      }
    } catch {
      toast.error('解绑失败');
    }
  };

  if (loading) return <div className="p-4 text-center"><Loading size="sm" /></div>;

  const isBound = coupleStatus?.status === 'active';

  return (
    <div className="space-y-3">
      {isBound ? (
        <>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-waibao-green-light/30">
            <Heart className="w-5 h-5 text-waibao-green" />
            <div>
              <p className="text-sm font-bold text-waibao-text">已绑定</p>
              {coupleStatus?.partner && (
                <p className="text-xs text-waibao-text-light mt-0.5">
                  与 {coupleStatus.partner.nickname} 绑定中
                </p>
              )}
              {coupleStatus?.loveStartDate && (
                <p className="text-xs text-waibao-text-light">
                  始于 {formatDate(coupleStatus.loveStartDate)}
                </p>
              )}
            </div>
          </div>
          {coupleStatus?.partner && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-waibao-pink-light/20">
              <Avatar src={coupleStatus.partner.avatar} size="md" />
              <div>
                <p className="text-sm font-bold text-waibao-text">{coupleStatus.partner.nickname}</p>
                <p className="text-xs text-waibao-text-light">另一半</p>
              </div>
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            icon={<Heart className="w-4 h-4" />}
            onClick={handleUnbind}
          >
            解除绑定
          </Button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-waibao-text-light mb-3">尚未绑定情侣</p>
          {coupleStatus?.bindCode ? (
            <>
              <div className="p-4 rounded-2xl bg-waibao-pink-light/30 mb-3">
                <p className="text-xs text-waibao-text-light mb-1">你的邀请码</p>
                <p className="text-2xl font-bold text-waibao-primary tracking-widest font-mono">
                  {coupleStatus.bindCode}
                </p>
                <p className="text-xs text-waibao-text-light mt-2">
                  把邀请码发给另一半，让他在注册时输入即可绑定
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Key className="w-4 h-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(coupleStatus.bindCode!);
                  toast.success('邀请码已复制到剪贴板');
                }}
              >
                复制邀请码
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={<Key className="w-4 h-4" />}
              onClick={async () => {
                try {
                  const res = await fetch('/api/couples/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success('邀请码已生成！');
                    fetchCoupleStatus();
                  } else {
                    toast.error(data.error || '生成失败');
                  }
                } catch {
                  toast.error('生成失败，请稍后重试');
                }
              }}
            >
              生成邀请码
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ========== 主页面 ==========
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  // Modal 状态
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 编辑资料
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [birthday, setBirthday] = useState(user?.birthday?.split('T')[0] || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [loveNickname, setLoveNickname] = useState(user?.loveNickname || '');
  const [comfortStyle, setComfortStyle] = useState(user?.comfortStyle || '');
  const [dislikeStyle, setDislikeStyle] = useState(user?.dislikeStyle || '');
  const [mbti, setMbti] = useState(user?.mbti || '');

  // 重要日期
  const [importantDates, setImportantDates] = useState<any[]>([]);
  const [dateTitle, setDateTitle] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [dateCategory, setDateCategory] = useState('anniversary');

  // 隐私/通知设置
  const [privacySettings, setPrivacySettings] = useState({
    allowSeeWishes: true,
    allowEmotionAlert: true,
    allowPeriodReminder: true,
    allowMoodView: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    dailyReminder: true,
  });

  // 加载重要日期
  useEffect(() => {
    fetchImportantDates();
  }, []);

  const fetchImportantDates = async () => {
    try {
      const res = await fetch('/api/important-dates');
      const data = await res.json();
      if (data.success) {
        setImportantDates(data.data?.dates || []);
      }
    } catch {
      // 静默
    }
  };

  // 保存资料
  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          birthday: birthday || null,
          gender: gender || null,
          loveNickname: loveNickname || null,
          comfortStyle: comfortStyle || null,
          dislikeStyle: dislikeStyle || null,
          mbti: mbti || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('保存成功！');
        refreshUser();
        setActiveModal(null);
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    }
  };

  // 新增重要日期
  const handleAddDate = async () => {
    if (!dateTitle.trim() || !dateValue) {
      toast.error('请填写完整信息');
      return;
    }
    try {
      const res = await fetch('/api/important-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dateTitle.trim(),
          date: dateValue,
          category: dateCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('日期已添加！');
        setActiveModal(null);
        setDateTitle('');
        setDateValue('');
        setDateCategory('anniversary');
        fetchImportantDates();
      } else {
        toast.error(data.error || '添加失败');
      }
    } catch {
      toast.error('添加失败');
    }
  };

  // 退出登录
  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout();
      router.push('/login');
    }
  };

  const genderOptions = [
    { value: '', label: '不显示' },
    { value: 'female', label: '女生' },
    { value: 'male', label: '男生' },
    { value: 'other', label: '其他' },
  ];

  const mbtiOptions = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  return (
    <div className="max-w-md mx-auto pb-8">
      {/* 顶部用户信息 */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="relative inline-block">
          <Avatar src={user?.avatar} size="xl" className="mx-auto" />
          {user?.role === 'waibao' && (
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-colored">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-waibao-text mt-3">{user?.nickname || '歪宝'}</h1>
        <Badge variant={user?.role === 'waibao' ? 'pink' : 'green'}>
          {user?.role === 'waibao' ? '小歪宝' : '另一半'}
        </Badge>
      </div>

      {/* 功能卡片列表 */}
      <div className="space-y-3">
        {/* 我的资料 */}
        <SettingCard
          icon={<User className="w-5 h-5 text-waibao-primary" />}
          title="我的资料"
          description={user?.nickname || '编辑个人信息'}
          onClick={() => {
            setNickname(user?.nickname || '');
            setBirthday(user?.birthday?.split('T')[0] || '');
            setGender(user?.gender || '');
            setLoveNickname(user?.loveNickname || '');
            setComfortStyle(user?.comfortStyle || '');
            setDislikeStyle(user?.dislikeStyle || '');
            setMbti(user?.mbti || '');
            setActiveModal('profile');
          }}
        />

        {/* 重要日期 */}
        <SettingCard
          icon={<Calendar className="w-5 h-5 text-waibao-secondary" />}
          title="重要日期"
          description={`${importantDates.length} 个日期`}
          onClick={() => {
            fetchImportantDates();
            setActiveModal('dates');
          }}
        />

        {/* 情侣绑定 */}
        <div className="rounded-2xl bg-white shadow-soft border border-waibao-pink-light/20 overflow-hidden">
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-waibao-pink-light/10 transition-colors"
            onClick={() => setActiveModal('couple')}
          >
            <div className="w-10 h-10 rounded-xl bg-waibao-pink-light flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-waibao-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-waibao-text">情侣绑定</p>
            </div>
            <ChevronRight className="w-5 h-5 text-waibao-text-light/40 shrink-0" />
          </div>
        </div>

        {/* 隐私设置 */}
        <SettingCard
          icon={<Shield className="w-5 h-5 text-waibao-purple" />}
          title="隐私设置"
          onClick={() => setActiveModal('privacy')}
        />

        {/* 通知设置 */}
        <SettingCard
          icon={<Bell className="w-5 h-5 text-waibao-green" />}
          title="通知设置"
          onClick={() => setActiveModal('notification')}
        />

        {/* 退出登录 */}
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">退出登录</p>
          </div>
          <ChevronRight className="w-5 h-5 text-red-300 shrink-0" />
        </div>
      </div>

      {/* ===== Modal: 我的资料 ===== */}
      <Modal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        title="编辑资料"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="你的昵称"
          />
          <Input
            label="生日"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">性别</label>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all',
                    gender === opt.value
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="恋爱昵称"
            value={loveNickname}
            onChange={(e) => setLoveNickname(e.target.value)}
            placeholder="另一半对你的昵称"
          />
          <Input
            label="喜欢的相处方式"
            value={comfortStyle}
            onChange={(e) => setComfortStyle(e.target.value)}
            placeholder="你喜欢被怎么对待？"
          />
          <Input
            label="不喜欢的相处方式"
            value={dislikeStyle}
            onChange={(e) => setDislikeStyle(e.target.value)}
            placeholder="你不喜欢被怎么对待？"
          />
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">MBTI</label>
            <div className="flex flex-wrap gap-1.5">
              {mbtiOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setMbti(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    mbti === m
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" className="w-full" onClick={handleSaveProfile}>
            保存
          </Button>
        </div>
      </Modal>

      {/* ===== Modal: 重要日期 ===== */}
      <Modal
        isOpen={activeModal === 'dates'}
        onClose={() => setActiveModal(null)}
        title="重要日期"
      >
        <div className="space-y-4">
          {importantDates.length === 0 ? (
            <p className="text-sm text-waibao-text-light text-center py-4">
              还没有重要日期，添加一个吧～
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {importantDates.map((d: any) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20"
                >
                  <div>
                    <p className="text-sm font-bold text-waibao-text">{d.title}</p>
                    <p className="text-xs text-waibao-text-light">
                      {formatDate(d.date)} {d.repeatType === 'yearly' ? '(每年)' : ''}
                    </p>
                  </div>
                  <Calendar className="w-4 h-4 text-waibao-primary" />
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-waibao-pink-light/30 pt-4 space-y-3">
            <p className="text-sm font-bold text-waibao-text">新增日期</p>
            <Input
              label="标题"
              value={dateTitle}
              onChange={(e) => setDateTitle(e.target.value)}
              placeholder="如：在一起纪念日"
            />
            <Input
              label="日期"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
            <Button variant="primary" className="w-full" icon={<Plus className="w-4 h-4" />} onClick={handleAddDate}>
              添加
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== Modal: 情侣绑定 ===== */}
      <Modal
        isOpen={activeModal === 'couple'}
        onClose={() => setActiveModal(null)}
        title="情侣绑定"
      >
        <CoupleBinding />
      </Modal>

      {/* ===== Modal: 隐私设置 ===== */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="隐私设置"
      >
        <div className="space-y-4">
          {user?.role === 'partner' ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">允许歪宝看我的心愿</p>
                  <p className="text-xs text-waibao-text-light">让歪宝知道你在准备惊喜</p>
                </div>
                <Toggle
                  checked={privacySettings.allowSeeWishes}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowSeeWishes: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">接收歪宝的情绪提醒</p>
                  <p className="text-xs text-waibao-text-light">歪宝不开心时及时收到通知</p>
                </div>
                <Toggle
                  checked={privacySettings.allowEmotionAlert}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowEmotionAlert: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">分享我的纪念日</p>
                  <p className="text-xs text-waibao-text-light">让歪宝看到你添加的重要日子</p>
                </div>
                <Toggle
                  checked={privacySettings.allowPeriodReminder}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowPeriodReminder: v })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">允许男朋友看心愿</p>
                  <p className="text-xs text-waibao-text-light">控制你的心愿对另一半可见</p>
                </div>
                <Toggle
                  checked={privacySettings.allowSeeWishes}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowSeeWishes: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">接收情绪提醒</p>
                  <p className="text-xs text-waibao-text-light">让男朋友知道你的情绪状态</p>
                </div>
                <Toggle
                  checked={privacySettings.allowEmotionAlert}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowEmotionAlert: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">看经期提醒</p>
                  <p className="text-xs text-waibao-text-light">允许男朋友查看经期信息</p>
                </div>
                <Toggle
                  checked={privacySettings.allowPeriodReminder}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowPeriodReminder: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
                <div>
                  <p className="text-sm font-bold text-waibao-text">看今日心情</p>
                  <p className="text-xs text-waibao-text-light">允许男朋友查看你今天的心情</p>
                </div>
                <Toggle
                  checked={privacySettings.allowMoodView}
                  onChange={(v) => setPrivacySettings({ ...privacySettings, allowMoodView: v })}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ===== Modal: 通知设置 ===== */}
      <Modal
        isOpen={activeModal === 'notification'}
        onClose={() => setActiveModal(null)}
        title="通知设置"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
            <div>
              <p className="text-sm font-bold text-waibao-text">推送通知</p>
              <p className="text-xs text-waibao-text-light">接收推送消息提醒</p>
            </div>
            <Toggle
              checked={notificationSettings.pushEnabled}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, pushEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
            <div>
              <p className="text-sm font-bold text-waibao-text">邮件通知</p>
              <p className="text-xs text-waibao-text-light">接收邮件提醒</p>
            </div>
            <Toggle
              checked={notificationSettings.emailEnabled}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, emailEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-waibao-pink-light/20">
            <div>
              <p className="text-sm font-bold text-waibao-text">每日提醒</p>
              <p className="text-xs text-waibao-text-light">每天接收温馨提醒</p>
            </div>
            <Toggle
              checked={notificationSettings.dailyReminder}
              onChange={(v) => setNotificationSettings({ ...notificationSettings, dailyReminder: v })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
