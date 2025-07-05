import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  Animated, 
  Pressable, 
  StatusBar,
  StyleSheet 
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useProgressStore } from '../state/progressStore';
import questionsData from '../data/questions.json';
import { Unit, Lesson } from '../types';
import { SidebarDrawer } from '../components/SidebarDrawer';

interface DuolingoHomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const DuolingoHomeScreen: React.FC<DuolingoHomeScreenProps> = ({ navigation }) => {
  const { completedLessons, getLessonProgress, totalXp } = useProgressStore();
  const units = questionsData.units as Unit[];
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(-width)).current; // Start off-screen
  const dropdownAnim = useRef(new Animated.Value(0)).current; // Dropdown animation

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    
    // Only respond to rightward swipes (positive translationX)
    if (translationX > 0) {
      if (!isMenuOpen) {
        setIsMenuOpen(true);
      }
      // Map translationX (0 to width) to slideAnim (-width to 0)
      const clampedTranslation = Math.max(-width, -width + translationX);
      slideAnim.setValue(clampedTranslation);
    }
  };

  const onHandlerStateChange = (event: any) => {
    // Show the drawer immediately when gesture begins
    if (event.nativeEvent.state === State.BEGAN) {
      if (!isMenuOpen) {
        setIsMenuOpen(true);
        // Ensure it starts fully closed
        slideAnim.setValue(-width);
      }
    }
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      // If dragged more than 20%, animate to fully open
      if (translationX > width * 0.2) {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }).start();
      } else {
        // Close the menu
        closeMenu();
      }
    }
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    slideAnim.setValue(0); // Instantly show the drawer
  };

  const closeMenu = () => {
    slideAnim.setValue(-width);
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      // Close dropdown
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setIsDropdownOpen(false));
    } else {
      // Open dropdown
      setIsDropdownOpen(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const currentUnit = units[currentUnitIndex];
  
  // Create lesson path
  const createLessonPath = () => {
    const lessons: Array<{
      lesson: Lesson;
      position: { x: number; y: number };
      isCompleted: boolean;
      isUnlocked: boolean;
      isCurrent: boolean;
      nodeType: 'start' | 'lesson' | 'checkpoint' | 'boss';
    }> = [];

    let currentY = 100;
    const centerX = width / 2;
    const offsetX = 60;
    const uniformSpacing = 140; // Consistent spacing between all nodes

    currentUnit.lessons.forEach((lesson, index) => {
      const isCompleted = completedLessons.includes(lesson.id);
      const isFirst = index === 0;
      const isLast = index === currentUnit.lessons.length - 1;
      
      // Create zigzag pattern
      let xPosition = centerX;
      if (index % 3 === 1) xPosition = centerX + offsetX;
      if (index % 3 === 2) xPosition = centerX - offsetX;
      
      const position = { x: xPosition, y: currentY };
      
      // Determine node type
      let nodeType: 'start' | 'lesson' | 'checkpoint' | 'boss' = 'lesson';
      if (isFirst) nodeType = 'start';
      else if (isLast) nodeType = 'boss';
      else if ((index + 1) % 3 === 0) nodeType = 'checkpoint';

      lessons.push({
        lesson,
        position,
        isCompleted,
        isUnlocked: true, // All lessons unlocked
        isCurrent: !isCompleted && lessons.every(l => l.isCompleted || l.lesson.id === lesson.id),
        nodeType
      });

      currentY += uniformSpacing; // Uniform spacing between nodes
    });

    return lessons;
  };

  const lessonPath = React.useMemo(() => createLessonPath(), [currentUnit, completedLessons, getLessonProgress]);

  // Calculate dynamic font sizes to ensure title fits in one line
  const [titleFontSize, setTitleFontSize] = useState(20);
  const [isTextMeasured, setIsTextMeasured] = useState(false);
  
  const dynamicFontSizes = React.useMemo(() => {
    const titleLength = currentUnit.title.length;
    let baseFontSize = titleFontSize;
    let secondaryFontSize = titleFontSize * 0.8;
    
    // Gentler character-based scaling since we allow 2 lines
    if (titleLength > 30) {
      baseFontSize = Math.min(baseFontSize, 16);
      secondaryFontSize = 13;
    } else if (titleLength > 25) {
      baseFontSize = Math.min(baseFontSize, 17);
      secondaryFontSize = 14;
    } else if (titleLength > 20) {
      baseFontSize = Math.min(baseFontSize, 18);
      secondaryFontSize = 15;
    } else if (titleLength > 15) {
      baseFontSize = Math.min(baseFontSize, 19);
      secondaryFontSize = 15.5;
    }
    
    return {
      title: baseFontSize,
      secondary: secondaryFontSize
    };
  }, [currentUnit.title, titleFontSize]);

    // Handle text layout to measure actual width
  const handleTextLayout = (event: any) => {
    if (isTextMeasured) return;
    
    const lines = event.nativeEvent.lines;
    const availableWidth = width - 180; // Account for menu button, streak, XP containers
    
    // Check if text fits on one line
    if (lines.length === 1 && lines[0].width <= availableWidth) {
      setIsTextMeasured(true);
      return;
    }
    
    // If text is too wide for one line and font is still large enough, try smaller font
    if (lines.length === 1 && lines[0].width > availableWidth && titleFontSize > 16) {
      setTitleFontSize(prev => Math.max(prev - 1, 16));
    } 
    // If font is already small (16px), allow 2 lines
    else {
      setIsTextMeasured(true);
    }
  };

  // Reset text measurement when unit changes
  React.useEffect(() => {
    setTitleFontSize(20);
    setIsTextMeasured(false);
  }, [currentUnitIndex]);

  // Calculate dynamic bottom padding based on number of lessons
  const dynamicBottomPadding = React.useMemo(() => {
    const lessonCount = currentUnit.lessons.length;
    const uniformSpacing = 140;
    const startY = 100;
    const nodeSize = 70;
    const ringSpacing = 28;
    
    // Account for variable label height based on text length
    // Labels can wrap to multiple lines with longer titles
    const estimatedLabelHeight = 60; // Increased from 40 to account for text wrapping
    
    // Dynamic navbar height handled in logic below
    
    // Calculate the Y position of the last lesson
    const lastLessonY = startY + (lessonCount - 1) * uniformSpacing;
    
    // Add extra padding to ensure the last lesson + its label + buffer is visible
    const totalContentHeight = lastLessonY + nodeSize + ringSpacing + estimatedLabelHeight;
    
    // Smart padding logic based on lesson count
    let baseNavbarHeight, minPadding, lessonCountBuffer, contentMultiplier, minGuarantee;
    
    if (lessonCount <= 5) {
      // Minimal padding for short units
      baseNavbarHeight = 80;
      minPadding = Math.max(80 + baseNavbarHeight, height * 0.15);
      lessonCountBuffer = 0;
      contentMultiplier = 0.12;
      minGuarantee = 160;
    } else if (lessonCount === 6) {
      // Perfect padding for 6 lessons (current "just right" amount)
      baseNavbarHeight = 140;
      minPadding = Math.max(140 + baseNavbarHeight, height * 0.3);
      lessonCountBuffer = 25; // 1 lesson above 5
      contentMultiplier = 0.25;
      minGuarantee = 300;
    } else {
      // Aggressive padding for 7+ lessons
      baseNavbarHeight = 140;
      minPadding = Math.max(140 + baseNavbarHeight, height * 0.3);
      lessonCountBuffer = 25 + (lessonCount - 6) * 30; // 25 for 6th + 30px per additional
      contentMultiplier = 0.25;
      minGuarantee = 300;
    }
    
    const dynamicPadding = Math.max(minPadding, totalContentHeight * contentMultiplier) + lessonCountBuffer + baseNavbarHeight;
    
    return Math.max(dynamicPadding, minGuarantee);
  }, [currentUnit.lessons.length, height]);

  const LessonNode = React.memo(({ item }: { item: any }) => {
    const getNodeColors = () => {
      if (item.isCompleted) return ['#58CC02', '#52B802'] as const;
      if (item.isCurrent) return ['#1CB0F6', '#1899D6'] as const;
      return ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'] as const;
    };

    const getNodeSize = () => {
      // Uniform size for all nodes
      return 70;
    };

    const getIcon = () => {
      if (item.nodeType === 'start') return 'star';
      if (item.nodeType === 'boss') return 'emoji-events';
      if (item.nodeType === 'checkpoint') return 'bookmark';
      return 'lightbulb';
    };

    // Calculate progress (0-100) based on actual question completion
    const getProgress = () => {
      if (item.isCompleted) return 100;
      
      const completedQuestions = getLessonProgress(item.lesson.id);
      const totalQuestions = item.lesson.questions.length;
      
      if (completedQuestions === 0) return 0;
      
      // Prevent going backwards - once a question is completed, progress is locked
      const progressPercentage = Math.min(100, (completedQuestions / totalQuestions) * 100);
      return progressPercentage;
    };

    const progress = getProgress();
    const nodeSize = getNodeSize();
    const strokeWidth = 7;
    const ringSpacing = 28;
    const radius = (nodeSize + ringSpacing) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Pressable
        style={[
          styles.lessonNodeContainer,
          {
            left: item.position.x - (nodeSize + ringSpacing) / 2,
            top: item.position.y,
            width: nodeSize + ringSpacing,
            height: nodeSize + ringSpacing,
          }
        ]}
        onPress={() => {
          navigation.navigate('Lesson', {
            lessonId: item.lesson.id,
            lesson: item.lesson
          });
        }}
      >
        {/* Progress Ring */}
        <View style={styles.progressRing}>
          {/* Background ring - always visible */}
          <View
            style={[
              styles.progressCircle,
              {
                width: nodeSize + ringSpacing,
                height: nodeSize + ringSpacing,
                borderRadius: (nodeSize + ringSpacing) / 2,
                borderWidth: strokeWidth,
                borderColor: 'rgba(255,255,255,0.2)',
              }
            ]}
          />
          {/* Progress arc using fewer segments for better performance */}
          {progress > 0 && Array.from({ length: Math.min(Math.ceil(progress / 10), 10) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  width: nodeSize + ringSpacing,
                  height: nodeSize + ringSpacing,
                  borderRadius: (nodeSize + ringSpacing) / 2,
                  borderWidth: strokeWidth,
                  borderColor: 'transparent',
                  borderTopColor: item.isCompleted ? '#58CC02' : '#1CB0F6',
                  transform: [
                    { rotate: `${index * 36 - 90}deg` }
                  ],
                  opacity: index * 10 <= progress ? 1 : 0,
                }
              ]}
            />
          ))}
        </View>

        {/* Main Node */}
        <LinearGradient
          colors={getNodeColors()}
          style={[
            styles.lessonNode,
            {
              width: nodeSize,
              height: nodeSize,
              position: 'absolute',
              top: ringSpacing / 2,
              left: ringSpacing / 2,
            }
          ]}
        >
          <View style={styles.nodeInner}>
            <MaterialIcons 
              name={getIcon()} 
              size={nodeSize * 0.4} 
              color={item.isCompleted || item.isCurrent ? "white" : "rgba(255,255,255,0.7)"} 
            />
          </View>
        </LinearGradient>

        {item.isCompleted && (
          <View style={[styles.checkmark, { bottom: 0, right: 0 }]}>
            <MaterialIcons name="check" size={16} color="white" />
          </View>
        )}
        {/* Lesson Title Label */}
        <BlurView
          intensity={50}
          tint="dark"
          style={[styles.lessonLabel, { 
            top: nodeSize + ringSpacing / 2 + (progress > 0 ? 18 : 10),
            width: 100,
            left: ((nodeSize + ringSpacing) - 100) / 2,
            marginTop: item.isCompleted ? 0 : 8,
          }]}
        >
          <Text style={styles.lessonText}>{item.lesson.title}</Text>
        </BlurView>

        {item.nodeType === 'start' && (
          <View style={[styles.startLabel, { top: -40 }]}>
            <Text style={styles.startText}>START</Text>
          </View>
        )}
      </Pressable>
    );
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Unit Info at Top */}
            <View style={styles.topUnitInfo}>
              <BlurView intensity={30} tint="dark" style={styles.topUnitCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.topUnitGradient}
                >
                  <Pressable onPress={toggleDropdown} style={styles.topUnitHeader}>
                    <Pressable 
                      style={styles.hamburgerMenu}
                      onPress={openMenu}
                    >
                      <MaterialIcons name="menu" size={20} color="white" />
                    </Pressable>
                    <View style={styles.unitTitleContainer}>
                      <Text 
                        style={[styles.topUnitTitle, { fontSize: dynamicFontSizes.title }]}
                        onTextLayout={handleTextLayout}
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.8}
                      >
                        {currentUnit.title}
                      </Text>
                    </View>
                    <View style={styles.topRightContent}>
                      <View style={styles.streakContainer}>
                        <MaterialIcons name="local-fire-department" size={dynamicFontSizes.secondary + 4} color="#FF9600" />
                        <Text style={[styles.streakText, { fontSize: dynamicFontSizes.secondary }]}>0</Text>
                      </View>
                      <View style={styles.xpContainer}>
                        <MaterialIcons name="star" size={dynamicFontSizes.secondary + 4} color="#FFD700" />
                        <Text style={[styles.xpText, { fontSize: dynamicFontSizes.secondary }]}>{totalXp}</Text>
                      </View>
                      <MaterialIcons 
                        name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </View>
                  </Pressable>
                  
                  {/* Animated Dropdown */}
                  {isDropdownOpen && (
                    <Animated.View 
                      style={[
                        styles.dropdownContainer,
                        {
                          maxHeight: dropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 100],
                          }),
                          opacity: dropdownAnim,
                        }
                      ]}
                    >
                      <View style={styles.dropdownContent}>
                        <Text style={styles.unitDescription}>{currentUnit.description}</Text>
                      </View>
                    </Animated.View>
                  )}
                </LinearGradient>
              </BlurView>
            </View>

            {/* Sidebar Drawer */}
            <SidebarDrawer
              isOpen={isMenuOpen}
              units={units}
              currentUnitIndex={currentUnitIndex}
              slideAnim={slideAnim}
              onClose={closeMenu}
              onUnitSelect={setCurrentUnitIndex}
            />

            {/* Header with Unit Navigation */}
            <View style={styles.header}>
              <View style={styles.centerSpace} />
            </View>

            {/* Path */}
            <PanGestureHandler 
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              minDist={0}
            >
              <View style={{ flex: 1 }}>
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.scrollView}
                  contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: dynamicBottomPadding }
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.pathArea}>
                    {/* Draw lesson nodes */}
                    {lessonPath.map((item, index) => (
                      <LessonNode key={item.lesson.id} item={item} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </PanGestureHandler>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </>
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
  topUnitInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  topUnitCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  topUnitGradient: {
    padding: 16,
  },
  topUnitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 0
  },
  hamburgerMenu: {
    padding: 4,
  },
  unitTitleContainer: {
    flex: 1,
  },
  topUnitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topUnitDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  topRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  centerSpace: {
    flex: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  streakText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  xpText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unitInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  unitTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  dropdownContainer: {
    overflow: 'hidden',
    marginTop: 8,
  },
  dropdownContent: {
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom is now calculated dynamically
  },
  pathArea: {
    flex: 1,
    minHeight: height * 0.8,
    position: 'relative',
  },
  lessonNodeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressSegment: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 2, // Rounded ends for progress segments
  },
  lessonNode: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#58CC02',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  startLabel: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#58CC02',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  startText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  lessonLabel: {
    position: 'absolute',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
  },

});