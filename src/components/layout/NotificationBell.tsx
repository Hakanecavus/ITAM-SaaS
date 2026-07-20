'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notification';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationBell({ subdomain }: { subdomain: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [subdomain]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await getUserNotifications(subdomain);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(subdomain, id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function handleMarkAllAsRead() {
    setLoading(true);
    await markAllNotificationsAsRead(subdomain);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setLoading(false);
  }

  function getIcon(type: string) {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'ERROR': return <AlertCircle className="text-red-500" size={16} />;
      case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="text-slate-600 dark:text-slate-400" size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Check size={14} /> Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Henüz bir bildiriminiz bulunmuyor.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className={`p-4 transition-colors ${notif.isRead ? 'bg-white dark:bg-slate-900' : 'bg-indigo-50/50 dark:bg-indigo-500/5'}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200 font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString('tr-TR')} {new Date(notif.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            {notif.link && (
                              <Link 
                                href={notif.link}
                                onClick={() => { if (!notif.isRead) handleMarkAsRead(notif.id); setIsOpen(false); }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                Görüntüle
                              </Link>
                            )}
                            {!notif.isRead && (
                              <button 
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                              >
                                Okundu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
