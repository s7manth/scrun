import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DEFAULT_APPS, TrackedAppId, getTodayISO, useUsage } from '@/store/usage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function HomeScreen() {
  const { trackedApps, toggleTrackedApp, addScrollMinutes, addRunMinutes } = useUsage();
  const today = getTodayISO();

  const onToggle = (id: TrackedAppId) => toggleTrackedApp(id);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">Scrun</ThemedText>
        </View>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.stepContainer}>
        <ThemedText type="subtitle">Select apps to track</ThemedText>
        <View style={styles.cardGrid}>
          {DEFAULT_APPS.map((app) => {
            const enabled = trackedApps.includes(app.id);
            return (
              <AppCard
                key={app.id}
                id={app.id}
                label={app.label}
                enabled={enabled}
                onPress={() => onToggle(app.id)}
              />
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.stepContainer}>
        <ThemedText type="subtitle">Quick log</ThemedText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={styles.logButton}>
            <ThemedText onPress={() => addScrollMinutes(today, 5)}>+5 min scroll</ThemedText>
          </View>
          <View style={styles.logButton}>
            <ThemedText onPress={() => addRunMinutes(today, 5)}>+5 min run</ThemedText>
          </View>
        </View>
        <ThemedText style={{ opacity: 0.7 }}>
          Tip: Tap multiple times to add more minutes.
        </ThemedText>
      </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  logButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
  },
});

type BrandSpec = {
  bg: string;
  bgInactive: string;
  fg: string;
  icon: { set: 'fa' | 'fa5' | 'fa6'; name: string };
};

const BRAND_MAP: Record<TrackedAppId, BrandSpec> = {
  instagram: {
    bg: '#E1306C',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'instagram' },
  },
  tiktok: {
    bg: '#010101',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'tiktok' },
  },
  twitter: {
    bg: '#1DA1F2',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'twitter' },
  },
  x: {
    bg: '#000000',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'x-twitter' },
  },
  facebook: {
    bg: '#1877F2',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'facebook' },
  },
  youtube: {
    bg: '#FF0000',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'youtube' },
  },
  snapchat: {
    bg: '#FFFC00',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#000000',
    icon: { set: 'fa6', name: 'snapchat' },
  },
  reddit: {
    bg: '#FF4500',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'reddit-alien' },
  },
  pinterest: {
    bg: '#E60023',
    bgInactive: 'rgba(127,127,127,0.08)',
    fg: '#ffffff',
    icon: { set: 'fa6', name: 'pinterest' },
  },
};

function AppIcon({ id, color, size = 28 }: { id: TrackedAppId; color: string; size?: number }) {
  const spec = BRAND_MAP[id].icon;
  if (spec.set === 'fa6') {
    return <FontAwesome6 name={spec.name as any} size={size} color={color} />;
  }
  if (spec.set === 'fa5') {
    return <FontAwesome5 name={spec.name as any} size={size} color={color} />;
  }
  return <FontAwesome name={spec.name as any} size={size} color={color} />;
}

function AppCard({
  id,
  label,
  enabled,
  onPress,
}: {
  id: TrackedAppId;
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  const { bg, bgInactive, fg } = BRAND_MAP[id];
  const active = useSharedValue(enabled ? 1 : 0);
  const pressed = useSharedValue(0);

  // sync animation when enabled changes
  active.value = withTiming(enabled ? 1 : 0, { duration: 220 });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(active.value, [0, 1], [bgInactive, bg]),
      transform: [{ scale: withSpring(pressed.value ? 0.98 : 1, { damping: 20, stiffness: 200 }) }],
      borderColor: interpolateColor(active.value, [0, 1], ['rgba(127,127,127,0.25)', 'transparent']),
    } as any;
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(active.value, [0, 1], ['#6b7280', fg]),
    } as any;
  });

  const iconColorStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolateColor(active.value, [0, 1], ['#6b7280', fg]) ? 1 : 1,
    } as any;
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      style={{ width: '30%' }}
    >
      <Animated.View
        style={[
          {
            padding: 12,
            borderRadius: 16,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            aspectRatio: 1,
          },
          animatedCardStyle,
        ]}
      >
        <Animated.View style={iconColorStyle}>
          <AppIcon id={id} color={enabled ? fg : '#6b7280'} size={28} />
        </Animated.View>
        <Animated.Text style={[{ fontWeight: enabled ? '700' : '500' }, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
