import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationManager = {
  async init() {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    
    // Create a high priority channel for alarms (Android only)
    await LocalNotifications.createChannel({
      id: 'water-alarms',
      name: 'Water Alarms',
      description: 'Critical hydration reminders',
      importance: 5, // max importance
      visibility: 1, // public
      vibration: true,
      sound: 'alarm_bright.wav', // We would need this asset, falling back to default if not found
    });
  },

  async schedule(timestamp: number, message: string) {
    // Clear existing notifications to avoid duplicates
    await this.cancelAll();

    if (timestamp <= Date.now()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Hydration Alert!',
          body: message,
          id: 1,
          schedule: { at: new Date(timestamp) },
          sound: 'alarm_bright.mp3', // Android sound asset name without extension usually
          actionTypeId: 'OPEN_ALARM',
          channelId: 'water-alarms',
          extra: {
            timestamp
          }
        }
      ]
    });
  },

  async cancelAll() {
    const list = await LocalNotifications.getPending();
    if (list.notifications.length > 0) {
      await LocalNotifications.cancel(list);
    }
  }
};
