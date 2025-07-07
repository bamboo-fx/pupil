import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChip from '../components/FilterChip';

// Import the questions data
import questionsData from '../data/questions.json';

interface Question {
  id: string;
  type: 'mcq' | 'fillInBlank';
  question: string;
  options?: string[];
  correctAnswer?: string; // For MCQ
  acceptedAnswers?: string[]; // For fillInBlank
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  unitTitle: string;
  lessonTitle: string;
}

const QuestionBankScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: '',
    topic: '',
    type: '',
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const ITEMS_PER_PAGE = 10;
  
  const insets = useSafeAreaInsets();

  // Flatten all questions from all units and lessons
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    questionsData.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        lesson.questions.forEach(question => {
          // Only process actual question objects (not lessons)
          // Check for both correctAnswer (MCQ) and acceptedAnswers (fillInBlank)
          if (question.id && question.question && (question.correctAnswer || question.acceptedAnswers)) {
            questions.push({
              id: question.id,
              type: question.type as 'mcq' | 'fillInBlank',
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer || (question.acceptedAnswers ? question.acceptedAnswers[0] : ''),
              acceptedAnswers: question.acceptedAnswers,
              explanation: question.explanation,
              difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
              topic: question.topic,
              unitTitle: unit.title,
              lessonTitle: lesson.title,
            });
          }
        });
      });
    });
    return questions;
  }, []);

  // Get unique values for filters
  const uniqueTopics = useMemo(() => {
    const topics = new Set(allQuestions.map(q => q.topic));
    return Array.from(topics).sort();
  }, [allQuestions]);

  const uniqueDifficulties = ['easy', 'medium', 'hard'];
  const uniqueTypes = ['mcq', 'fillInBlank'];

  // Filter questions based on search query and filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(question => {
      const matchesSearch = searchQuery === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.unitTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.explanation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = selectedFilters.difficulty === '' || 
        question.difficulty === selectedFilters.difficulty;

      const matchesTopic = selectedFilters.topic === '' || 
        question.topic === selectedFilters.topic;

      const matchesType = selectedFilters.type === '' || 
        question.type === selectedFilters.type;

      return matchesSearch && matchesDifficulty && matchesTopic && matchesType;
    });
  }, [allQuestions, searchQuery, selectedFilters]);

  // Paginated questions
  const paginatedQuestions = useMemo(() => {
    const totalItems = currentPage * ITEMS_PER_PAGE;
    const questions = filteredQuestions.slice(0, totalItems);
    setHasMoreData(totalItems < filteredQuestions.length);
    return questions;
  }, [filteredQuestions, currentPage]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setHasMoreData(true);
  }, [filteredQuestions.length, searchQuery, selectedFilters]);

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      setIsLoadingMore(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMoreData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const clearFilters = () => {
    setSelectedFilters({
      difficulty: '',
      topic: '',
      type: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
    setHasMoreData(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return 'quiz';
      case 'fillInBlank': return 'text-fields';
      default: return 'help';
    }
  };

  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'arrays': return 'view-list';
      case 'hashmap': return 'storage';
      case 'stack': return 'layers';
      case 'trees': return 'account-tree';
      case 'graphs': return 'timeline';
      case 'sorting': return 'sort';
      case 'greedy': return 'trending-up';
      case 'dynamic_programming': return 'memory';
      case 'linked_lists': return 'link';
      case 'searching': return 'search';
      default: return 'category';
    }
  };

  const renderFilterChip = (label: string, value: string, filterKey: keyof typeof selectedFilters) => (
    <FilterChip
      key={value}
      label={label}
      isSelected={selectedFilters[filterKey] === value}
      onPress={() => setSelectedFilters(prev => ({
        ...prev,
        [filterKey]: prev[filterKey] === value ? '' : value
      }))}
    />
  );

  const renderQuestion = ({ item }: { item: Question }) => {
    const isExpanded = expandedQuestions.has(item.id);
    
    return (
      <BlurView intensity={60} tint="dark" style={styles.questionCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
          style={styles.questionGradient}
        >
          <TouchableOpacity
            onPress={() => toggleQuestionExpansion(item.id)}
            style={styles.questionHeader}
          >
            <View style={styles.questionHeaderTop}>
              <View style={styles.questionMeta}>
                <BlurView intensity={40} tint="dark" style={styles.metaItem}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.metaGradient}
                  >
                    <MaterialIcons name={getTypeIcon(item.type)} size={14} color="#9ca3af" />
                    <Text style={styles.metaText}>{item.type === 'mcq' ? 'Multiple Choice' : 'Fill in Blank'}</Text>
                  </LinearGradient>
                </BlurView>
                <BlurView intensity={40} tint="dark" style={[styles.difficultyBadge, { backgroundColor: 'transparent' }]}>
                  <LinearGradient
                    colors={[getDifficultyColor(item.difficulty), getDifficultyColor(item.difficulty) + '80']}
                    style={styles.difficultyGradient}
                  >
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                  </LinearGradient>
                </BlurView>
                <BlurView intensity={40} tint="dark" style={styles.metaItem}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.metaGradient}
                  >
                    <MaterialIcons name={getTopicIcon(item.topic)} size={14} color="#9ca3af" />
                    <Text style={styles.metaText}>{item.topic}</Text>
                  </LinearGradient>
                </BlurView>
              </View>
              <MaterialIcons 
                name={isExpanded ? "expand-less" : "expand-more"} 
                size={24} 
                color="#9ca3af" 
              />
            </View>
            
            <Text style={styles.questionText} numberOfLines={isExpanded ? undefined : 2}>
              {item.question}
            </Text>
            
            <BlurView intensity={30} tint="dark" style={styles.questionPath}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                style={styles.pathGradient}
              >
                <MaterialIcons name="route" size={12} color="#6b7280" style={{ marginRight: 4 }} />
                <Text style={styles.pathText}>
                  {item.unitTitle} → {item.lessonTitle}
                </Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

          {isExpanded && (
            <BlurView intensity={40} tint="dark" style={styles.expandedContent}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                style={styles.expandedGradient}
              >
                {item.options && (
                  <View style={styles.optionsContainer}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="list" size={16} color="#9ca3af" />
                      <Text style={styles.optionsTitle}>Options:</Text>
                    </View>
                    {item.options.map((option, index) => (
                      <BlurView key={index} intensity={30} tint="dark" style={styles.optionItem}>
                        <LinearGradient
                          colors={option === item.correctAnswer ? 
                            ['rgba(34,197,94,0.2)', 'rgba(34,197,94,0.1)'] :
                            ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                          }
                          style={styles.optionGradient}
                        >
                          <MaterialIcons 
                            name={option === item.correctAnswer ? "check-circle" : "radio-button-unchecked"} 
                            size={16} 
                            color={option === item.correctAnswer ? "#22c55e" : "#6b7280"} 
                          />
                          <Text style={[
                            styles.optionText,
                            option === item.correctAnswer && styles.correctOptionText
                          ]}>
                            {String.fromCharCode(65 + index)}. {option}
                          </Text>
                        </LinearGradient>
                      </BlurView>
                    ))}
                  </View>
                )}
                
                <BlurView intensity={30} tint="dark" style={styles.answerContainer}>
                  <LinearGradient
                    colors={['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.08)']}
                    style={styles.answerGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="check-circle" size={16} color="#22c55e" />
                      <Text style={styles.answerTitle}>
                        {item.type === 'fillInBlank' ? 'Accepted Answers:' : 'Correct Answer:'}
                      </Text>
                    </View>
                    <Text style={styles.answerText}>
                      {item.type === 'fillInBlank' && item.acceptedAnswers 
                        ? item.acceptedAnswers.join(', ') 
                        : item.correctAnswer}
                    </Text>
                  </LinearGradient>
                </BlurView>
                
                <BlurView intensity={30} tint="dark" style={styles.explanationContainer}>
                  <LinearGradient
                    colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.08)']}
                    style={styles.explanationGradient}
                  >
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="lightbulb" size={16} color="#3b82f6" />
                      <Text style={styles.explanationTitle}>Explanation:</Text>
                    </View>
                    <Text style={styles.explanationText}>{item.explanation}</Text>
                  </LinearGradient>
                </BlurView>
              </LinearGradient>
            </BlurView>
          )}
        </LinearGradient>
      </BlurView>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <BlurView intensity={40} tint="dark" style={styles.footerLoaderBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.footerLoaderGradient}
          >
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.footerLoaderText}>Loading more questions...</Text>
          </LinearGradient>
        </BlurView>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (filteredQuestions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <BlurView intensity={40} tint="dark" style={styles.emptyStateBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.emptyStateGradient}
            >
              <MaterialIcons name="search-off" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>No questions found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or filters
              </Text>
            </LinearGradient>
          </BlurView>
        </View>
      );
    }
    return null;
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <FlatList
          data={paginatedQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Header */}
              <BlurView intensity={60} tint="dark" style={styles.header}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContent}>
                    {searchActive ? (
                      <View style={styles.searchBarHeaderContainer}>
                        <MaterialIcons name="search" size={22} color="#9ca3af" />
                        <TextInput
                          style={styles.headerSearchInput}
                          placeholder="Search questions, topics..."
                          placeholderTextColor="#9ca3af"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          autoFocus
                        />
                        <TouchableOpacity onPress={() => { setSearchActive(false); setSearchQuery(''); }}>
                          <MaterialIcons name="close" size={22} color="#9ca3af" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.headerTitle}>Question Bank</Text>
                        <TouchableOpacity onPress={() => setSearchActive(true)}>
                          <MaterialIcons name="search" size={28} color="#ffffff" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  <Text style={styles.headerSubtitle}>
                    Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
                    {filteredQuestions.length !== allQuestions.length && ` (${allQuestions.length} total)`}
                  </Text>
                </LinearGradient>
              </BlurView>

              {/* Filters */}
              <BlurView intensity={50} tint="dark" style={styles.filtersContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.filtersGradient}
                >
                  <TouchableOpacity 
                    style={styles.filtersHeader}
                    onPress={() => setFiltersExpanded(!filtersExpanded)}
                    activeOpacity={0.8}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <MaterialIcons name="filter-list" size={20} color="#9ca3af" />
                      <Text style={styles.filtersHeaderTitle}>Filters</Text>
                    </View>
                    <MaterialIcons 
                      name={filtersExpanded ? "expand-less" : "expand-more"} 
                      size={28} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>

                  {filtersExpanded && (
                    <View style={styles.filtersContent}>
                      <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Difficulty</Text>
                        <View style={styles.filterGroupContainer}>
                          {uniqueDifficulties.map(difficulty => 
                            renderFilterChip(difficulty, difficulty, 'difficulty')
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Topic</Text>
                        <View style={styles.filterGroupContainer}>
                          {uniqueTopics.map(topic => 
                            renderFilterChip(topic, topic, 'topic')
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Type</Text>
                        <View style={styles.filterGroupContainer}>
                          {uniqueTypes.map(type => 
                            renderFilterChip(type === 'mcq' ? 'Multiple Choice' : 'Fill in Blank', type, 'type')
                          )}
                        </View>
                      </View>
                      
                      <BlurView intensity={40} tint="dark" style={styles.clearFiltersButton}>
                        <LinearGradient
                          colors={['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.1)']}
                          style={styles.clearFiltersGradient}
                        >
                          <TouchableOpacity style={styles.clearFiltersTouch} onPress={clearFilters}>
                            <MaterialIcons name="clear-all" size={16} color="#ef4444" />
                            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </BlurView>
                    </View>
                  )}
                </LinearGradient>
              </BlurView>
            </>
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.questionsList,
            { paddingBottom: insets.bottom + 140 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  searchBarHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  headerSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  filtersContainer: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filtersGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  filtersHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginLeft: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterGroup: {
    marginTop: 12,
  },
  filterGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearFiltersButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  clearFiltersGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clearFiltersTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 6,
    fontWeight: '600',
  },
  questionsList: {
    paddingHorizontal: 16,
  },
  questionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  questionGradient: {
    padding: 16,
  },
  questionHeader: {
    marginBottom: 8,
  },
  questionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  difficultyBadge: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  difficultyGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 8,
  },
  questionPath: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pathGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pathText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  expandedGradient: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 6,
  },
  optionItem: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 8,
  },
  correctOptionText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  answerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  answerGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  answerTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  explanationContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  explanationGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  explanationTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 6,
  },
  explanationText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerLoaderBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  footerLoaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLoaderText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  emptyStateGradient: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default QuestionBankScreen; 