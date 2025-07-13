import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const createDynamicStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  alertContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 400,
    width: '100%',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  alertHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  alertTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },

  alertMessage: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  singleButton: {
    flex: 1,
  },

  firstButton: {
    marginRight: 6,
  },

  lastButton: {
    marginLeft: 6,
  },

  destructiveButton: {
    backgroundColor: Colors.medical.red,
  },

  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  buttonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    color: 'white',
    fontWeight: '500',
  },

  destructiveButtonText: {
    color: 'white',
  },

  cancelButtonText: {
    color: colors.text,
  },
});

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}) => {
  const { colors } = useTheme();
  
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (
    Platform.OS !== 'web' &&
    Platform.OS !== 'android' &&
    Platform.OS !== 'ios'
  ) {
    return null;
  }

  const dynamicStyles = createDynamicStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.alertContainer}>
          <View style={dynamicStyles.alertHeader}>
            <View style={dynamicStyles.iconContainer}>
              <AlertCircle size={24} color={Colors.primary} />
            </View>
            <Text style={dynamicStyles.alertTitle}>{title}</Text>
          </View>

          {message && <Text style={dynamicStyles.alertMessage}>{message}</Text>}

          <View style={dynamicStyles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  dynamicStyles.alertButton,
                  button.style === 'destructive' && dynamicStyles.destructiveButton,
                  button.style === 'cancel' && dynamicStyles.cancelButton,
                  buttons.length === 1 && dynamicStyles.singleButton,
                  index === 0 && buttons.length > 1 && dynamicStyles.firstButton,
                  index === buttons.length - 1 &&
                    buttons.length > 1 &&
                    dynamicStyles.lastButton,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    dynamicStyles.buttonText,
                    button.style === 'destructive' &&
                      dynamicStyles.destructiveButtonText,
                    button.style === 'cancel' && dynamicStyles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook for using custom alerts
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onDismiss={hideAlert}
    />
  );

  return { showAlert, AlertComponent };
};