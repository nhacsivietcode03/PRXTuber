import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import colors from '../theme/colors';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

const TimeWheel = ({ data, selectedValue, onValueChange }) => {
  const flatListRef = useRef(null);

  // Add empty items for padding at top and bottom to center the selected item
  const extendedData = ['', ...data, ''];

  useEffect(() => {
    // Scroll to the selected value on mount or when visibility changes
    const index = data.indexOf(selectedValue);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
        });
      }, 100);
    }
  }, [selectedValue]);

  const onScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < data.length) {
      const newValue = data[index];
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.selectionIndicator} />
      <FlatList
        ref={flatListRef}
        data={extendedData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.wheelItem}>
            <Text style={[
              styles.wheelText,
              item === selectedValue && styles.wheelTextSelected
            ]}>
              {item !== '' ? item.toString().padStart(2, '0') : ''}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const SleepTimerSheet = ({
  visible,
  onClose,
  timerActive,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
  formatCountdown,
  onStartTimer,
  onCancelTimer,
  hours,
  minutes,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
            <Text style={styles.headerTitle}>Sleep timer</Text>
          </View>

          <View style={styles.content}>
            {timerActive ? (
              /* Countdown View */
              <View style={styles.countdownContainer}>
                <View style={styles.countdownDisplay}>
                  <Text style={styles.countdownText}>{formatCountdown()}</Text>
                  <Text style={styles.countdownLabel}>remaining</Text>
                </View>

                <TouchableOpacity
                  style={styles.cancelTimerButton}
                  onPress={() => {
                    onCancelTimer();
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelTimerText}>Cancel timer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Time Picker View */
              <>
                <View style={styles.pickerWrapper}>
                  <View style={styles.pickerContainer}>
                    <TimeWheel
                      data={hours}
                      selectedValue={selectedHour}
                      onValueChange={setSelectedHour}
                    />
                    <Text style={styles.pickerSeparator}>:</Text>
                    <TimeWheel
                      data={minutes}
                      selectedValue={selectedMinute}
                      onValueChange={setSelectedMinute}
                    />
                  </View>

                  <View style={styles.labelsContainer}>
                    <Text style={styles.pickerLabel}>hours</Text>
                    <View style={{ width: 40 }} />
                    <Text style={styles.pickerLabel}>minutes</Text>
                  </View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => {
                    onStartTimer();
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  countdownDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 24,
    width: '100%',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  cancelTimerButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: 'rgba(255, 78, 78, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 78, 0.2)',
    alignItems: 'center',
  },
  cancelTimerText: {
    color: '#FF4E4E',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 3,
    width: '100%',
  },
  wheelContainer: {
    height: ITEM_HEIGHT * 3,
    width: 100,
    overflow: 'hidden',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 28,
    color: '#666',
    fontWeight: '500',
  },
  wheelTextSelected: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '700',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(2, 205, 172, 0.1)',
    borderRadius: 12,
  },
  pickerSeparator: {
    fontSize: 34,
    color: colors.textSecondary,
    fontWeight: '700',
    marginHorizontal: 10,
    paddingBottom: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 100,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 30,
  },
});

export default SleepTimerSheet;
