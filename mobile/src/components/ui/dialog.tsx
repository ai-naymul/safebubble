import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ visible, onClose, title, description, children }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            {title && (
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            )}
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => (
  <View style={[styles.dialogContent, className ? {} : {}]}>
    {children}
  </View>
);

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <View style={[styles.dialogHeader, className ? {} : {}]}>
    {children}
  </View>
);

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => (
  <View style={[styles.dialogFooter, className ? {} : {}]}>
    {children}
  </View>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <Text variant="h3" weight="semibold" style={[styles.dialogTitle, className ? {} : {}]}>
    {children}
  </Text>
);

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <Text variant="body" color="secondary" style={[styles.dialogDescription, className ? {} : {}]}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    ...shadows.xl,
  },
  content: {
    padding: spacing.lg,
  },
  dialogContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  dialogHeader: {
    marginBottom: spacing.md,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dialogTitle: {
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  dialogDescription: {
    lineHeight: 20,
  },
});

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
