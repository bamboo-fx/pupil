import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavbarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const getIcon = (routeName: string, isFocused: boolean) => {
    const size = 32;
    const color = isFocused ? '#60a5fa' : 'rgba(255,255,255,0.6)';
    
    switch (routeName) {
      case 'Learn':
        return <Ionicons name={isFocused ? 'cube' : 'cube-outline'} size={size} color={color} />;
      case 'Search':
        return <Ionicons name={isFocused ? 'search' : 'search-outline'} size={size} color={color} />;
      case 'Leaderboard':
        return <Ionicons name={isFocused ? 'trophy' : 'trophy-outline'} size={size} color={color} />;
      case 'Profile':
        return <MaterialCommunityIcons name={isFocused ? 'account' : 'account-outline'} size={size} color={color} />;
      default:
        return <Ionicons name="book-outline" size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbarInfo}>
        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={[styles.gradient, { paddingBottom: Math.max(insets.bottom - 10, 0) }]}
          >
            <View style={styles.navContainer}>
              {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={[
                    styles.navItem,
                    isFocused && styles.navItemFocused
                  ]}
                >
                  {getIcon(route.name, isFocused)}
                </Pressable>
              );
            })}
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navbarInfo: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 52, // Ensure consistent height for centering
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8, // More square/rectangular shape
    minHeight: 52, // Consistent height for proper centering
  },
  navItemFocused: {
    backgroundColor: 'rgba(96,165,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
}); 