import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle
}) => {
  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      case 'success':
        return styles.buttonSuccess;
      case 'primary':
      default:
        return styles.buttonPrimary;
    }
  };

  // Determine text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      case 'secondary':
      case 'primary':
      case 'danger':
      case 'success':
      default:
        return styles.textPrimary;
    }
  };

  // Determine size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      case 'medium':
      default:
        return styles.buttonMedium;
    }
  };

  // Determine text size styles
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      case 'medium':
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.primary : colors.white} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text 
            style={[
              getTextStyle(), 
              getTextSizeStyle(),
              icon && styles.textWithIcon,
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonSuccess: {
    backgroundColor: colors.success || '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonMedium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  textPrimary: {
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  textOutline: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});

export default Button;