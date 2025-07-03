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
import { useProgressStore } from '../state/progressStore';
import questionsData from '../data/questions.json';
import { Unit, Lesson } from '../types';

interface DuolingoHomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const DuolingoHomeScreen: React.FC<DuolingoHomeScreenProps> = ({ navigation }) => {
  const { completedLessons, getLessonProgress, totalXp } = useProgressStore();
  const units = questionsData.units as Unit[];
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(-width)).current; // Start off-screen

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

  const LessonNode = React.memo(({ item }: { item: any }) => {
    const getNodeColor = () => {
      if (item.isCompleted) return '#58CC02'; // Green for completed
      if (item.isCurrent) return '#1CB0F6'; // Blue for current
      return '#E5E5E5'; // Gray for locked
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
                borderColor: '#E5E5E5',
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
        <View
          style={[
            styles.lessonNode,
            {
              width: nodeSize,
              height: nodeSize,
              backgroundColor: getNodeColor(),
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
            color={item.isCompleted || item.isCurrent ? "white" : "#999999"} 
          />
        </View>
        </View>

        {item.isCompleted && (
          <View style={[styles.checkmark, { bottom: 0, right: 0 }]}>
            <MaterialIcons name="check" size={16} color="white" />
          </View>
        )}
        {/* Lesson Title Label */}
        <View style={[styles.lessonLabel, { 
          top: nodeSize + ringSpacing / 2 + (progress > 0 ? 18 : 10),
          width: 100,
          left: ((nodeSize + ringSpacing) - 100) / 2,
          marginTop: item.isCompleted ? 0 : 8,
        }]}>
          <Text style={styles.lessonText}>{item.lesson.title}</Text>
        </View>

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
      <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                                {/* Unit Info at Top */}
           <View style={styles.topUnitInfo}>
             <View style={styles.topUnitHeader}>
               <Pressable 
                 style={styles.hamburgerMenu}
                 onPress={openMenu}
               >
                 <MaterialIcons name="menu" size={20} color="#333" />
               </Pressable>
               <View style={styles.unitTitleContainer}>
                 <Text style={styles.topUnitTitle}>{currentUnit.title}</Text>
               </View>
               <View style={styles.topRightContent}>
                 <View style={styles.streakContainer}>
                   <MaterialIcons name="local-fire-department" size={20} color="#FF9600" />
                   <Text style={styles.streakText}>0</Text>
                 </View>
                 <View style={styles.xpContainer}>
                   <MaterialIcons name="star" size={20} color="#FFD700" />
                   <Text style={styles.xpText}>{totalXp}</Text>
                 </View>
               </View>
             </View>
           </View>

           {/* Animated Drawer Menu */}
             <Animated.View 
               pointerEvents={isMenuOpen ? 'auto' : 'none'}
               style={[
                 styles.animatedDrawer,
                 {
                   transform: [{ translateX: slideAnim }],
                 }
               ]}
             >
               {/* Header */}
               <View style={styles.drawerHeader}>
                 <Text style={styles.drawerTitle}>Select Unit</Text>
                 <Pressable style={styles.drawerCloseButton} onPress={closeMenu}>
                   <MaterialIcons name="close" size={24} color="#666" />
                 </Pressable>
               </View>
               
               {/* Units List */}
               <ScrollView
                 style={styles.drawerScrollView}
                 contentContainerStyle={styles.drawerScrollContent}
                 showsVerticalScrollIndicator={false}
               >
                 {units.map((unit, index) => (
                   <Pressable
                     key={unit.id}
                     style={[
                       styles.drawerMenuItem,
                       { backgroundColor: index === currentUnitIndex ? '#E3F2FD' : 'transparent' }
                     ]}
                     onPress={() => {
                       setCurrentUnitIndex(index);
                       closeMenu();
                     }}
                   >
                     <View style={styles.drawerMenuItemContent}>
                       <View style={[
                         styles.unitIcon,
                         { backgroundColor: index === currentUnitIndex ? '#1CB0F6' : '#E5E5E5' }
                       ]}>
                         <Text style={[
                           styles.unitIconText,
                           { color: index === currentUnitIndex ? 'white' : '#666' }
                         ]}>
                           {index + 1}
                         </Text>
                       </View>
                       <View style={styles.unitInfoSection}>
                         <Text style={[
                           styles.drawerMenuItemTitle,
                           { color: index === currentUnitIndex ? '#1CB0F6' : '#333' }
                         ]}>
                           {unit.title}
                         </Text>
                         <Text style={styles.drawerMenuItemDescription}>
                           {unit.description}
                         </Text>
                       </View>
                     </View>
                     {index === currentUnitIndex && (
                       <MaterialIcons name="check-circle" size={24} color="#1CB0F6" />
                     )}
                   </Pressable>
                 ))}
               </ScrollView>
             </Animated.View>

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
                contentContainerStyle={styles.scrollContent}
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  topUnitDescription: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xpText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unitInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  unitTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
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
    shadowOpacity: 0.15,
    shadowRadius: 5,
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
    borderColor: 'white',
  },
  startLabel: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#58CC02',
  },
  startText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#58CC02',
  },
  lessonLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#AFAFAF',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1000,
  },
  drawerScrollContent: {
    paddingBottom: 30,
    paddingTop: 8,
  },
  animatedDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1100,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerCloseButton: {
    padding: 8,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 2,
  },
  drawerMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  unitIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  drawerMenuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  drawerMenuItemDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});