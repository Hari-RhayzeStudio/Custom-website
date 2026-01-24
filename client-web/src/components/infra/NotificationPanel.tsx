// client-web/app/components/NotificationPanel.tsx
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CalendarIcon, AlertTriangleIcon, XIcon, CheckCircleIcon, LoaderIcon } from '@/components/Icons';

interface Notification {
  id: string;
  type: 'booking' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const userId = localStorage.getItem('user_id');

    // 1. Static System Notifications (Warnings/Info)
    let fetchedNotes: Notification[] = [
      {
        id: 'sys-1',
        type: 'warning',
        title: 'Complete your profile',
        message: 'Add your email address to receive meeting links.',
        date: 'Action Required',
        read: false,
        link: '/profile'
      }
    ];

    // 2. Fetch Real Booking Data from Backend
    if (userId) {
      try {
        const res = await axios.get(`http://localhost:3001/api/bookings/user/${userId}`);
        const bookings = res.data;

        // Transform booking data into notifications
        const bookingNotes = bookings.map((b: any) => ({
          id: `booking-${b.id}`,
          type: 'booking',
          title: 'Booking Confirmed',
          message: `Consultation with ${b.expert_name} on ${new Date(b.consultation_date).toLocaleDateString()} at ${b.slot}.`,
          date: new Date(b.created_at).toLocaleDateString(),
          read: true, 
          link: '/bookings' 
        }));

        // Combine: Newest bookings first
        fetchedNotes = [...bookingNotes, ...fetchedNotes];
      } catch (err) {
        console.error("Failed to fetch bookings for notifications", err);
      }
    }

    setNotifications(fetchedNotes);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-80 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <h3 className="font-serif font-bold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-200">
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content List */}
      <div className="max-h-400px overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <LoaderIcon className="w-5 h-5 animate-spin text-[#7D3C98]" />
            <span>Checking updates...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6 text-gray-300" />
            </div>
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((note) => (
              <div 
                key={note.id} 
                className={`p-4 hover:bg-gray-50 transition flex gap-3 items-start relative group ${!note.read ? 'bg-purple-50/40' : ''}`}
              >
                {/* Icon Indicator */}
                <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white
                  ${note.type === 'booking' ? 'bg-green-100 text-green-600' : 
                    note.type === 'warning' ? 'bg-orange-100 text-orange-500' : 
                    'bg-blue-100 text-blue-600'}`
                }>
                  {note.type === 'booking' && <CheckCircleIcon className="w-4 h-4" />}
                  {note.type === 'warning' && <AlertTriangleIcon className="w-4 h-4" />}
                  {note.type === 'info' && <CalendarIcon className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{note.title}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{note.date}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {note.message}
                  </p>
                  
                  {note.link && (
                    <Link 
                      href={note.link} 
                      onClick={onClose} 
                      className="inline-flex items-center text-[11px] font-bold text-[#7D3C98] hover:underline mt-2 group-hover:translate-x-1 transition-transform"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
                
                {/* Unread Indicator */}
                {!note.read && (
                  <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
        <button className="text-xs font-bold text-gray-500 hover:text-[#7D3C98] transition">
          Mark all as read
        </button>
      </div>
    </div>
  );
}