import { Platform, Alert } from 'react-native';

/**
 * Cross-platform sharing utility that works on both native and web
 */
export const shareData = async (options: { 
  title?: string; 
  message: string;
  url?: string;
  filename?: string;
}) => {
  try {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.message,
          url: options.url,
        });
        return { action: 'shared' } as const;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(options.message);
        Alert.alert('Copied', 'Data copied to clipboard');
        return { action: 'shared' } as const;
      }

      showShareAlert(options);
      return { action: 'dismissed' } as const;
    } else {
      const { Share } = require('react-native');
      return await Share.share({
        title: options.title,
        message: options.message,
        url: options.url,
      });
    }
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Share Failed', 'There was an error sharing your data.');
    return { action: 'dismissed' };
  }
};

const showShareAlert = (options: { title?: string; message: string; url?: string; filename?: string }) => {
  Alert.alert(
    options.title || 'Share',
    'On a real device, this would share the following content:' +
    (options.filename ? '\n\nFilename: ' + options.filename : '') +
    '\n\nContent: ' + options.message.substring(0, 100) + '...' +
    (options.url ? '\n\nURL: ' + options.url : ''),
    [{ text: 'OK' }]
  );
};