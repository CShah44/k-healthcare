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

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}) => {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertHeader}>
            <View style={styles.iconContainer}>
              <AlertCircle size={24} color={Colors.primary} />
            </View>
            <Text style={styles.alertTitle}>{title}</Text>
          </View>

          {message && <Text style={styles.alertMessage}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                  buttons.length === 1 && styles.singleButton,
                  index === 0 && buttons.length > 1 && styles.firstButton,
                  index === buttons.length - 1 &&
                    buttons.length > 1 &&
                    styles.lastButton,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' &&
                      styles.destructiveButtonText,
                    button.style === 'cancel' && styles.cancelButtonText,
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  alertHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  alertTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    color: Colors.text,
    textAlign: 'center',
  },

  alertMessage: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    color: Colors.textSecondary,
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  buttonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    color: 'white',
  },

  destructiveButtonText: {
    color: 'white',
  },

  cancelButtonText: {
    color: Colors.text,
  },
});
