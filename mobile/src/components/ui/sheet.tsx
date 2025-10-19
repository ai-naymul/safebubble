import React, { useEffect } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'bottom' | 'top' | 'left' | 'right';
}

interface SheetContentProps {
  children: React.ReactNode;
}

interface SheetHeaderProps {
  children: React.ReactNode;
}

interface SheetFooterProps {
  children: React.ReactNode;
}

interface SheetTitleProps {
  children: React.ReactNode;
}

interface SheetDescriptionProps {
  children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ visible, onClose, children, side = 'bottom' }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(side === 'bottom' ? 1 : -1));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
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
        Animated.timing(slideAnim, {
          toValue: side === 'bottom' ? 1 : -1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, side]);

  const translateY = Animated.multiply(slideAnim, Dimensions.get('window').height);

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
            styles.sheet,
            side === 'bottom' ? styles.sheetBottom : styles.sheetTop,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const SheetContent: React.FC<SheetContentProps> = ({ children }) => (
  <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
    {children}
  </ScrollView>
);

const SheetHeader: React.FC<SheetHeaderProps> = ({ children }) => (
  <View style={styles.header}>
    {children}
  </View>
);

const SheetFooter: React.FC<SheetFooterProps> = ({ children }) => (
  <View style={styles.footer}>
    {children}
  </View>
);

const SheetTitle: React.FC<SheetTitleProps> = ({ children }) => (
  <Text variant="h2" weight="bold" style={styles.sheetTitle}>
    {children}
  </Text>
);

const SheetDescription: React.FC<SheetDescriptionProps> = ({ children }) => (
  <Text variant="body" color="secondary" style={styles.sheetDescription}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '90%',
    ...shadows.lg,
  },
  sheetBottom: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  sheetTop: {
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.primary,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  sheetTitle: {
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  sheetDescription: {
    lineHeight: 20,
  },
});

export { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };