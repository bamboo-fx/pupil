import React, { useState, useMemo } from 'react';
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
  correctAnswer: string;
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
  const insets = useSafeAreaInsets();

  // Flatten all questions from all units and lessons
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    questionsData.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        lesson.questions.forEach(question => {
          // Only process actual question objects (not lessons)
          if (question.id && question.question && question.correctAnswer) {
            questions.push({
              id: question.id,
              type: question.type as 'mcq' | 'fillInBlank',
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
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
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
      case 'mcq': return 'radio-button-checked';
      case 'fillInBlank': return 'edit';
      default: return 'help';
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
      <BlurView intensity={30} style={styles.questionCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.questionGradient}
        >
          <TouchableOpacity
            onPress={() => toggleQuestionExpansion(item.id)}
            style={styles.questionHeader}
          >
            <View style={styles.questionHeaderTop}>
              <View style={styles.questionMeta}>
                <View style={styles.metaItem}>
                  <MaterialIcons name={getTypeIcon(item.type)} size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>{item.type}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                  <Text style={styles.difficultyText}>{item.difficulty}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="category" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>{item.topic}</Text>
                </View>
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
            
            <View style={styles.questionPath}>
              <Text style={styles.pathText}>
                {item.unitTitle} → {item.lessonTitle}
              </Text>
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {item.options && (
                <View style={styles.optionsContainer}>
                  <Text style={styles.optionsTitle}>Options:</Text>
                  {item.options.map((option, index) => (
                    <View key={index} style={styles.optionItem}>
                      <Text style={[
                        styles.optionText,
                        option === item.correctAnswer && styles.correctOptionText
                      ]}>
                        {String.fromCharCode(65 + index)}. {option}
                        {option === item.correctAnswer && ' ✓'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.answerContainer}>
                <Text style={styles.answerTitle}>Correct Answer:</Text>
                <Text style={styles.answerText}>{item.correctAnswer}</Text>
              </View>
              
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>Explanation:</Text>
                <Text style={styles.explanationText}>{item.explanation}</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </BlurView>
    );
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <FlatList
          data={filteredQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Header */}
              <BlurView intensity={30} style={styles.header}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
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
                    {filteredQuestions.length} of {allQuestions.length} questions
                  </Text>
                </LinearGradient>
              </BlurView>

              {/* Filters */}
              <View style={styles.filtersContainer}>
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
                    
                    <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                      <MaterialIcons name="clear-all" size={16} color="#ef4444" />
                      <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          }
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
    borderRadius: 16,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginTop: 8,
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
    borderRadius: 12,
    overflow: 'hidden',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 16,
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
  },
  pathText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 8,
  },
  optionItem: {
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  correctOptionText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  answerContainer: {
    marginBottom: 16,
  },
  answerTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  explanationContainer: {},
  explanationTitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});

export default QuestionBankScreen; 