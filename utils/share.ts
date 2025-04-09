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
    // For web, show alert
    if (Platform.OS === 'web') {
      console.log("Web platform detected, showing alert");
      showShareAlert(options);
      return { action: 'dismissed' };
    } 
    // For native platforms, use React Native's Share API
    else {
      console.log("Sharing on native platform");
      // Import Share dynamically to avoid web issues
      const { Share } = require('react-native');
      return await Share.share({
        title: options.title,
        message: options.message,
        url: options.url
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