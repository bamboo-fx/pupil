import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Unit } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  units: Unit[];
  currentUnitIndex: number;
  slideAnim: Animated.Value;
  onClose: () => void;
  onUnitSelect: (index: number) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  units,
  currentUnitIndex,
  slideAnim,
  onClose,
  onUnitSelect
}) => {
  const handleUnitPress = (index: number) => {
    onUnitSelect(index);
    onClose();
  };

  return (
    <Animated.View 
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        }
      ]}
    >
      <BlurView intensity={95} tint="dark" style={styles.blurView}>
        <LinearGradient
          colors={['rgba(26,26,46,0.95)', 'rgba(22,33,62,0.95)', 'rgba(15,52,96,0.98)']}
          style={styles.gradient}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <BlurView intensity={40} tint="dark" style={styles.headerCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.titleIconContainer}>
                      <MaterialIcons name="school" size={24} color="#60a5fa" />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>Learning Path</Text>
                      <Text style={styles.headerSubtitle}>Choose your unit</Text>
                    </View>
                  </View>
                  <Pressable style={styles.closeButton} onPress={onClose}>
                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.8)" />
                  </Pressable>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
          
          {/* Units List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.unitsContainer}>
              {units.map((unit, index) => {
                const isSelected = index === currentUnitIndex;
                return (
                  <Pressable
                    key={unit.id}
                    style={styles.unitItem}
                    onPress={() => handleUnitPress(index)}
                  >
                    <BlurView 
                      intensity={isSelected ? 60 : 30} 
                      tint="dark" 
                      style={[styles.unitCard, isSelected && styles.unitCardSelected]}
                    >
                      <LinearGradient
                        colors={isSelected ? 
                          ['rgba(96,165,250,0.25)', 'rgba(59,130,246,0.15)'] :
                          ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                        }
                        style={styles.unitGradient}
                      >
                        <View style={styles.unitContent}>
                          {/* Unit Icon */}
                          <View style={styles.unitIconSection}>
                            <LinearGradient
                              colors={isSelected ? 
                                ['#60a5fa', '#3b82f6'] :
                                ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']
                              }
                              style={styles.unitIcon}
                            >
                              <Text style={[
                                styles.unitNumber,
                                { color: isSelected ? 'white' : 'rgba(255,255,255,0.8)' }
                              ]}>
                                {index + 1}
                              </Text>
                            </LinearGradient>
                            {isSelected && (
                              <View style={styles.selectedIndicator}>
                                <MaterialIcons name="check-circle" size={20} color="#60a5fa" />
                              </View>
                            )}
                          </View>

                          {/* Unit Info */}
                          <View style={styles.unitInfo}>
                            <Text style={[
                              styles.unitTitle,
                              { color: isSelected ? '#60a5fa' : 'white' }
                            ]}>
                              {unit.title}
                            </Text>
                            <Text style={styles.unitDescription} numberOfLines={2}>
                              {unit.description}
                            </Text>
                          </View>

                          {/* Arrow Indicator */}
                          <View style={styles.arrowContainer}>
                            <MaterialIcons 
                              name="chevron-right" 
                              size={20} 
                              color={isSelected ? '#60a5fa' : 'rgba(255,255,255,0.4)'} 
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1100,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96,165,250,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Account for bottom navbar
  },
  unitsContainer: {
    paddingHorizontal: 20,
  },
  unitItem: {
    marginBottom: 12,
  },
  unitCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  unitCardSelected: {
    borderColor: 'rgba(96,165,250,0.4)',
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  unitGradient: {
    padding: 16,
  },
  unitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitIconSection: {
    position: 'relative',
    marginRight: 16,
  },
  unitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  unitNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  unitInfo: {
    flex: 1,
    marginRight: 12,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 