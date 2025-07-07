import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useProgressStore } from '../state/progressStore';
import { useAuthStore } from '../state/authStore';

export const SimpleProfileScreen: React.FC = () => {
  const { totalXp, completedLessons, resetProgress, streak, achievements } = useProgressStore();
  const { user, logout } = useAuthStore();
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const currentLevel = Math.floor(totalXp / 100) + 1;
  const xpInCurrentLevel = totalXp % 100;
  const xpForNextLevel = 100;
  const levelProgress = xpInCurrentLevel / xpForNextLevel;

  const visibleAchievements = showAllAchievements ? (achievements || []) : (achievements || []).slice(0, 3);

  const stats = [
    {
      label: 'Day Streak',
      value: streak,
      icon: 'local-fire-department',
      color: '#f59e0b', // amber-500
    },
    {
      label: 'Total XP',
      value: totalXp,
      icon: 'star',
      color: '#facc15', // yellow-400
    },
    {
      label: 'Level',
      value: currentLevel,
      icon: 'auto-awesome',
      color: '#3b82f6', // blue-500
    },
    {
      label: 'Lessons',
      value: completedLessons.length,
      icon: 'school',
      color: '#22c55e', // green-500 0 
    },
  ];

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: async () => {
            try {
              await resetProgress();
              Alert.alert(
                "Success",
                "Your progress has been reset successfully.",
                [{ text: "OK" }]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "There was an error resetting your progress. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Avatar & Info */}
            <BlurView intensity={60} tint="dark" style={styles.profileCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                style={styles.profileContent}
              >
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.avatar}
                  >
                    <MaterialIcons name="person" size={48} color="white" />
                  </LinearGradient>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{currentLevel}</Text>
                  </View>
                </View>
                
                <Text style={styles.userName}>{user?.fullName || 'DSA Master'}</Text>
                <Text style={styles.userTitle}>Level {currentLevel} Explorer</Text>
                
                {/* Level Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Level {currentLevel}</Text>
                    <Text style={styles.progressLabel}>Level {currentLevel + 1}</Text>
                  </View>
                  <BlurView intensity={30} tint="dark" style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb']}
                      style={[styles.progressBar, { width: `${levelProgress * 100}%` }]}
                    />
                  </BlurView>
                  <Text style={styles.progressText}>
                    {xpInCurrentLevel}/{xpForNextLevel} XP to next level
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>

            {/* Stats Grid */}
            <BlurView intensity={60} tint="dark" style={styles.statsCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                style={styles.cardContent}
              >
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                  {stats.map((stat, index) => (
                    <View key={index} style={styles.statItem}>
                      <BlurView intensity={50} tint="dark" style={styles.statCard}>
                        <LinearGradient
                          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                          style={styles.statCardGradient}
                        >
                          <View style={styles.statTopRow}>
                            <MaterialIcons name={stat.icon as any} size={22} color={stat.color} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                          </View>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </LinearGradient>
                      </BlurView>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </BlurView>

            {/* Achievements */}
            <BlurView intensity={60} tint="dark" style={styles.achievementsCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                style={styles.cardContent}
              >
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.achievementsList}>
                  {visibleAchievements.map((achievement) => (
                    <BlurView
                      key={achievement.id}
                      intensity={achievement.isUnlocked ? 50 : 30}
                      tint="dark"
                      style={[
                        styles.achievementItem,
                        achievement.isUnlocked ? styles.achievementUnlocked : styles.achievementLocked,
                      ]}
                    >
                      <LinearGradient
                        colors={achievement.isUnlocked ? 
                          ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.08)'] :
                          ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                        }
                        style={styles.achievementGradient}
                      >
                        <View style={styles.achievementContent}>
                          <View style={[
                            styles.achievementIcon,
                            achievement.isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked
                          ]}>
                            <MaterialIcons 
                              name={achievement.isUnlocked ? achievement.icon as any : 'lock'} 
                              size={24} 
                              color={achievement.isUnlocked ? "#3b82f6" : "rgba(255,255,255,0.4)"} 
                            />
                          </View>
                          <View style={styles.achievementText}>
                            <Text style={styles.achievementTitle}>{achievement.title}</Text>
                            <Text style={styles.achievementDescription}>{achievement.description}</Text>
                          </View>
                          {achievement.isUnlocked && (
                            <View style={styles.achievementCheckmark}>
                              <MaterialIcons name="check" size={16} color="white" />
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </BlurView>
                  ))}
                </View>
                {achievements.length > 3 && (
                  <Pressable 
                    onPress={() => setShowAllAchievements(!showAllAchievements)}
                    style={styles.viewAllButton}
                  >
                    <BlurView intensity={40} tint="dark" style={styles.viewAllBlur}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.viewAllGradient}
                      >
                        <Text style={styles.viewAllText}>
                          {showAllAchievements ? 'Show Less' : 'View All'}
                        </Text>
                        <MaterialIcons 
                          name={showAllAchievements ? 'expand-less' : 'expand-more'} 
                          size={20} 
                          color="rgba(255,255,255,0.7)" 
                        />
                      </LinearGradient>
                    </BlurView>
                  </Pressable>
                )}
              </LinearGradient>
            </BlurView>

            {/* Settings */}
            <BlurView intensity={60} tint="dark" style={styles.settingsCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                style={styles.cardContent}
              >
                <Text style={styles.sectionTitle}>Settings</Text>
                
                <View style={styles.settingsList}>
                  <Pressable onPress={handleResetProgress}>
                    <BlurView intensity={50} tint="dark" style={styles.settingItemReset}>
                      <LinearGradient
                        colors={['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.08)']}
                        style={styles.settingGradient}
                      >
                        <View style={styles.settingContent}>
                          <View style={styles.settingIconReset}>
                            <MaterialIcons name="refresh" size={20} color="#ef4444" />
                          </View>
                          <Text style={styles.settingText}>Reset Progress</Text>
                          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </Pressable>
                  
                  <Pressable onPress={() => logout()}>
                    <BlurView intensity={50} tint="dark" style={styles.settingItem}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.settingGradient}
                      >
                        <View style={styles.settingContent}>
                          <View style={styles.settingIcon}>
                            <MaterialIcons name="logout" size={20} color="rgba(255,255,255,0.7)" />
                          </View>
                          <Text style={styles.settingText}>Sign Out</Text>
                          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </Pressable>
                </View>
              </LinearGradient>
            </BlurView>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  profileCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileContent: {
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  statsCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  achievementsCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardGradient: {
    padding: 16,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementUnlocked: {
    borderColor: 'rgba(59,130,246,0.4)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  achievementLocked: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  achievementDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  achievementCheckmark: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItemReset: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  settingIconReset: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  settingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
  },
  viewAllButton: {
    marginTop: 8,
  },
  viewAllBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewAllText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginRight: 4,
  },
  settingGradient: {
    padding: 8,
  },
});