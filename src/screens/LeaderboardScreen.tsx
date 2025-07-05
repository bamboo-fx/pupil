import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../state/authStore';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  total_xp: number;
  level: number;
  streak: number;
  avatar_url?: string;
  total_lessons_completed: number;
  rank: number;
}

export const LeaderboardScreen: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const loadLeaderboard = async () => {
    try {
      // Get top 50 users from leaderboard
      const { data: topUsers, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(50);

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      setLeaderboardData(topUsers || []);

      // Find current user's rank
      if (user) {
        const { data: userRankData, error: userError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!userError && userRankData) {
          setUserRank(userRankData);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: 'emoji-events', color: '#FFD700' }; // Gold
      case 2:
        return { icon: 'emoji-events', color: '#C0C0C0' }; // Silver
      case 3:
        return { icon: 'emoji-events', color: '#CD7F32' }; // Bronze
      default:
        return { icon: 'person', color: 'rgba(255,255,255,0.7)' };
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { borderColor: 'rgba(255,215,0,0.3)', backgroundColor: 'rgba(255,215,0,0.1)' };
      case 2:
        return { borderColor: 'rgba(192,192,192,0.3)', backgroundColor: 'rgba(192,192,192,0.1)' };
      case 3:
        return { borderColor: 'rgba(205,127,50,0.3)', backgroundColor: 'rgba(205,127,50,0.1)' };
      default:
        return { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' };
    }
  };

  const LeaderboardItem = ({ item, isCurrentUser = false }: { item: LeaderboardEntry; isCurrentUser?: boolean }) => {
    const rankInfo = getRankIcon(item.rank);
    const rankStyle = getRankStyle(item.rank);

    return (
      <BlurView 
        intensity={isCurrentUser ? 50 : 30} 
        tint="dark" 
        style={[
          styles.leaderboardItem,
          rankStyle,
          isCurrentUser && styles.currentUserItem
        ]}
      >
        <LinearGradient
          colors={isCurrentUser 
            ? ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.1)'] 
            : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
          }
          style={styles.itemGradient}
        >
          {/* Rank */}
          <View style={styles.rankContainer}>
            <Text style={[styles.rankText, item.rank <= 3 && { color: rankInfo.color }]}>
              #{item.rank}
            </Text>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={item.rank <= 3 ? [rankInfo.color, rankInfo.color] : ['#3b82f6', '#2563eb']}
              style={styles.avatar}
            >
              <MaterialIcons name={rankInfo.icon as any} size={24} color="white" />
            </LinearGradient>
            {item.rank <= 3 && (
              <View style={[styles.rankBadge, { backgroundColor: rankInfo.color }]}>
                <MaterialIcons name="star" size={12} color="white" />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.full_name || 'Anonymous User'}
            </Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="auto-awesome" size={14} color="#3b82f6" />
                <Text style={styles.statText}>Lv.{item.level}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="school" size={14} color="#22c55e" />
                <Text style={styles.statText}>{item.total_lessons_completed || 0}</Text>
              </View>
              {item.streak > 0 && (
                <View style={styles.statItem}>
                  <MaterialIcons name="local-fire-department" size={14} color="#f59e0b" />
                  <Text style={styles.statText}>{item.streak}</Text>
                </View>
              )}
            </View>
          </View>

          {/* XP */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>{item.total_xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </LinearGradient>
      </BlurView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Header */}
          <BlurView intensity={30} tint="dark" style={styles.header}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <MaterialIcons name="leaderboard" size={28} color="#FFD700" />
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={styles.headerRight}>
                  <MaterialIcons name="emoji-events" size={24} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
            </LinearGradient>
          </BlurView>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
            }
          >
            {/* Your Rank Card */}
            {userRank && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Ranking</Text>
                <LeaderboardItem item={userRank} isCurrentUser={true} />
              </View>
            )}

            {/* Top Performers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Performers</Text>
              
              {/* Podium for Top 3 */}
              {leaderboardData.length >= 3 && (
                <BlurView intensity={30} tint="dark" style={styles.podiumContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.podiumGradient}
                  >
                    <View style={styles.podium}>
                      {/* 2nd Place */}
                      <View style={[styles.podiumItem, styles.secondPlace]}>
                        <LinearGradient colors={['#C0C0C0', '#A0A0A0']} style={styles.podiumAvatar}>
                          <MaterialIcons name="emoji-events" size={20} color="white" />
                        </LinearGradient>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {leaderboardData[1]?.full_name || 'User'}
                        </Text>
                        <Text style={styles.podiumXp}>{leaderboardData[1]?.total_xp} XP</Text>
                        <View style={styles.podiumRank}>
                          <Text style={styles.podiumRankText}>2</Text>
                        </View>
                      </View>

                      {/* 1st Place */}
                      <View style={[styles.podiumItem, styles.firstPlace]}>
                        <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.podiumAvatar}>
                          <MaterialIcons name="emoji-events" size={24} color="white" />
                        </LinearGradient>
                        <MaterialIcons name="stars" size={20} color="#FFD700" style={styles.crown} />
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {leaderboardData[0]?.full_name || 'User'}
                        </Text>
                        <Text style={styles.podiumXp}>{leaderboardData[0]?.total_xp} XP</Text>
                        <View style={styles.podiumRank}>
                          <Text style={styles.podiumRankText}>1</Text>
                        </View>
                      </View>

                      {/* 3rd Place */}
                      <View style={[styles.podiumItem, styles.thirdPlace]}>
                        <LinearGradient colors={['#CD7F32', '#B8860B']} style={styles.podiumAvatar}>
                          <MaterialIcons name="emoji-events" size={20} color="white" />
                        </LinearGradient>
                        <Text style={styles.podiumName} numberOfLines={1}>
                          {leaderboardData[2]?.full_name || 'User'}
                        </Text>
                        <Text style={styles.podiumXp}>{leaderboardData[2]?.total_xp} XP</Text>
                        <View style={styles.podiumRank}>
                          <Text style={styles.podiumRankText}>3</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              )}

              {/* Full Leaderboard */}
              <View style={styles.leaderboardList}>
                {leaderboardData.map((item) => (
                  <LeaderboardItem 
                    key={item.id} 
                    item={item} 
                    isCurrentUser={item.id === user?.id}
                  />
                ))}
              </View>

              {isLoading && (
                <BlurView intensity={30} tint="dark" style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading leaderboard...</Text>
                </BlurView>
              )}

              {!isLoading && leaderboardData.length === 0 && (
                <BlurView intensity={30} tint="dark" style={styles.emptyContainer}>
                  <MaterialIcons name="emoji-events" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>No rankings yet</Text>
                  <Text style={styles.emptySubtext}>Complete lessons to appear on the leaderboard!</Text>
                </BlurView>
              )}
            </View>
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
  header: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  headerRight: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    marginLeft: 4,
  },
  podiumContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  podiumGradient: {
    padding: 24,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 140,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    flex: 1,
  },
  firstPlace: {
    paddingBottom: 20,
  },
  secondPlace: {
    paddingBottom: 40,
  },
  thirdPlace: {
    paddingBottom: 60,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  crown: {
    position: 'absolute',
    top: -10,
    right: 12,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumXp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  podiumRank: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  currentUserItem: {
    borderColor: 'rgba(59,130,246,0.4)',
  },
  itemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rankContainer: {
    width: 40,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  loadingContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
}); 