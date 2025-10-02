import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const progress = useSharedValue(0);
  const pillX = useSharedValue(0);
  const pillWidth = 56;
  const itemLayouts = useRef<Record<string, { x: number; width: number }>>({});

  useEffect(() => {
    progress.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) });
  }, [progress]);

  const containerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [50, 0]);
    const opacity = progress.value;
    const scale = interpolate(progress.value, [0, 1], [0.96, 1]);
    return { transform: [{ translateY }, { scale }], opacity };
  });

  // Move the pill whenever the focused index changes (and when layouts are known)
  useEffect(() => {
    const route = state.routes[state.index];
    const layout = itemLayouts.current[route.key];
    if (layout) {
      pillX.value = withTiming(layout.x + layout.width / 2 - pillWidth / 2, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [state.index, state.routes, pillX]);

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Animated.View style={[styles.container, containerStyle]}> 
        <Animated.View style={[styles.pill, useAnimatedStyle(() => ({ width: pillWidth, transform: [{ translateX: pillX.value }] }))]} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // Animate icon scale based on focus state + press feedback
          const focus = useSharedValue(isFocused ? 1 : 0);
          const press = useSharedValue(1);
          useEffect(() => {
            focus.value = withTiming(isFocused ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) });
          }, [isFocused, focus]);
          const scaleStyle = useAnimatedStyle(() => ({
            transform: [{ scale: interpolate(focus.value, [0, 1], [1, 1.15]) * press.value }],
          }));

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onPressIn={() => {
                press.value = withSpring(0.95, { damping: 14, stiffness: 140 });
              }}
              onPressOut={() => {
                press.value = withSpring(1, { damping: 12, stiffness: 120 });
              }}
              onLayout={(ev) => {
                const { x, width } = ev.nativeEvent.layout;
                itemLayouts.current[route.key] = { x, width };
                if (isFocused) {
                  pillX.value = withTiming(x + width / 2 - pillWidth / 2, { duration: 320, easing: Easing.out(Easing.cubic) });
                }
              }}
              style={styles.item}
              accessibilityRole="button"
            >
              <Animated.View style={scaleStyle}>
                {typeof options.tabBarIcon === 'function' ? (
                  <IconSymbol name={(options as any).tabBarIcon?.({ color: isFocused ? '#0A7EA4' : '#888' })?.props?.name || (route.name === 'index' ? 'house.fill' : 'person.fill')} color={isFocused ? '#0A7EA4' : '#888'} size={24} />
                ) : (
                  <IconSymbol name={route.name === 'index' ? 'house.fill' : 'person.fill'} color={isFocused ? '#0A7EA4' : '#888'} size={24} />
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    alignSelf: 'center',
    marginHorizontal: 16,
    marginBottom: Platform.select({ ios: 32, android: 32, default: 32 }),
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    height: undefined,
    width: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(10,126,164,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.25)',
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
});


