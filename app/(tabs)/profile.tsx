import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getTodayISO, getTomorrowISO, useUsage } from '@/store/usage';

export default function ProfileScreen() {
  const { getDay } = useUsage();
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();
  const dToday = getDay(today);
  const dTomorrow = getDay(tomorrow);
  const requiredRunTomorrow = Math.max(0, dToday.scrollMinutes - dToday.runMinutes);
  const metToday = dTomorrow.runMinutes >= dToday.scrollMinutes;

  const pulse = useSharedValue(0);
  pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);

  const ringStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.06]);
    const opacity = interpolate(pulse.value, [0, 1], [0.3, 0.6]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FDDDD6', dark: '#3F2D2A' }}
      headerImage={
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      <View style={styles.card}>
        <ThemedText type="subtitle">Today</ThemedText>
        <ThemedText>Scrolled: {dToday.scrollMinutes} min</ThemedText>
        <ThemedText>Ran: {dToday.runMinutes} min</ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Tomorrow&apos;s Goal</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.pulseContainer}>
            <Animated.View style={[styles.pulseRing, ringStyle]} />
            <View style={styles.pulseCore} />
          </View>
          <ThemedText>
            Run at least {requiredRunTomorrow} min to offset today&apos;s scroll.
          </ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle">Status</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: metToday ? '#0A7EA4' : '#B00020' }}>
          {metToday ? 'Unlocked' : 'Locked until run completed'}
        </ThemedText>
        <ThemedText style={{ opacity: 0.7 }}>
          Apps will be accessible the day after you match your scroll time with running.
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 130,
    width: 130,
    bottom: -10,
    left: -10,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    gap: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
  },
  pulseContainer: {
    height: 22,
    width: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: '#0A7EA4',
  },
  pulseCore: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#0A7EA4',
  },
});


