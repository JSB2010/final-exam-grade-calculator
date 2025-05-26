import { useState, useEffect, useCallback } from 'react';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

interface ScheduledReminder {
  id: string; // e.g., 'daily-study-reminder'
  time: string; // HH:MM format
  title: string;
  options?: NotificationOptions;
}

interface UseNotificationsReturn {
  permissionStatus: NotificationPermissionStatus;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  showLocalNotification: (title: string, options?: NotificationOptions) => void; // Changed return type
  scheduleDailyReminder: (reminder: ScheduledReminder) => void;
  cancelScheduledReminder: (reminderId: string) => void;
  checkActiveReminders: () => void; // For debugging or UI display
}

// Store timeout IDs outside the hook to persist across re-renders
const activeTimeouts: { [key: string]: NodeJS.Timeout } = {};


const useNotifications = (): UseNotificationsReturn => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  // To track scheduled reminders (primarily for debugging or advanced UI)
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);

  // Check current permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission as NotificationPermissionStatus);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported by this browser.');
      return 'denied';
    }

    const status = await Notification.requestPermission();
    setPermissionStatus(status as NotificationPermissionStatus);
    console.log('Notification permission status:', status);
    return status as NotificationPermissionStatus;
  }, []);

  const showLocalNotification = useCallback(
    (title: string, options?: NotificationOptions): void => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('Notifications not supported by this browser.');
        return;
      }

      if (Notification.permission !== 'granted') {
        console.warn(`Notification permission is ${Notification.permission}. Cannot show notification.`);
        return;
      }
      
      const defaultOptions: NotificationOptions = {
        body: 'You have a new reminder!',
        icon: '/icon.svg',
        tag: 'default-reminder', // Use a default tag or allow override via options
        ...options,
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready
          .then(registration => {
            registration.showNotification(title, defaultOptions);
            console.log(`Notification "${title}" shown via Service Worker.`);
          })
          .catch(err => {
            console.error('Service Worker not ready, falling back to client-side notification.', err);
            // Fallback for browsers where SW might be ready but showNotification fails, or for quicker local dev.
            new Notification(title, defaultOptions); 
          });
      } else {
        console.warn('Service Worker not available, showing client-side notification.');
        new Notification(title, defaultOptions);
      }
    },
    [] // permissionStatus is checked directly via Notification.permission
  );

  const scheduleDailyReminder = useCallback(
    (reminder: ScheduledReminder) => {
      if (permissionStatus !== 'granted') {
        console.warn(`Cannot schedule reminder "${reminder.id}". Permission not granted.`);
        return;
      }

      // Clear any existing timeout for this reminder ID
      if (activeTimeouts[reminder.id]) {
        clearTimeout(activeTimeouts[reminder.id]);
        delete activeTimeouts[reminder.id];
      }

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const now = new Date();
      let nextReminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

      if (nextReminderTime.getTime() <= now.getTime()) {
        // If the time has already passed for today, schedule for tomorrow
        nextReminderTime.setDate(nextReminderTime.getDate() + 1);
      }

      const delay = nextReminderTime.getTime() - now.getTime();

      console.log(`Scheduling reminder "${reminder.id}" for ${nextReminderTime.toLocaleString()}. Delay: ${delay}ms`);

      activeTimeouts[reminder.id] = setTimeout(() => {
        console.log(`Triggering scheduled reminder: "${reminder.title}"`);
        showLocalNotification(reminder.title, reminder.options);
        // Re-schedule for the next day
        scheduleDailyReminder(reminder); 
      }, delay);
      
      setScheduledReminders(prev => [...prev.filter(r => r.id !== reminder.id), reminder]);
    },
    [permissionStatus, showLocalNotification]
  );

  const cancelScheduledReminder = useCallback((reminderId: string) => {
    if (activeTimeouts[reminderId]) {
      clearTimeout(activeTimeouts[reminderId]);
      delete activeTimeouts[reminderId];
      setScheduledReminders(prev => prev.filter(r => r.id !== reminderId));
      console.log(`Cancelled scheduled reminder: "${reminderId}"`);
    }
  }, []);
  
  const checkActiveReminders = useCallback(() => {
    console.log("Currently active timeouts for reminders:", Object.keys(activeTimeouts));
    console.log("Scheduled reminder configurations:", scheduledReminders);
  }, [scheduledReminders]);


  // Effect to re-evaluate permission status if it changes in browser settings
  useEffect(() => {
    const handlePermissionChange = () => {
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission as NotificationPermissionStatus);
      }
    };
    // Browsers might not universally support this event, but it's good practice
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then(permissionObj => {
        permissionObj.onchange = handlePermissionChange;
      });
    }
    return () => {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' }).then(permissionObj => {
          permissionObj.onchange = null;
        }).catch(() => {}); // Catch potential errors if query fails
      }
    };
  }, []);


  return {
    permissionStatus,
    requestPermission,
    showLocalNotification,
    scheduleDailyReminder,
    cancelScheduledReminder,
    checkActiveReminders,
  };
};

export default useNotifications;
