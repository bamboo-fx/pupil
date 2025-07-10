// CRITICAL FIX: Convert from React web to React Native for production compatibility
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface InteractiveVisualizationQuestionProps {
  question: string;
  visualizationData: {
    array: number[];
    target: number;
    type: string;
  };
  correctSequence: number[];
  explanation: string;
  onComplete: (correct: boolean) => void;
}

const InteractiveVisualizationQuestion: React.FC<InteractiveVisualizationQuestionProps> = ({
  question,
  visualizationData,
  correctSequence,
  explanation,
  onComplete
}) => {
  const [clickedSequence, setClickedSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const { array, target } = visualizationData;

  const handleElementClick = (index: number) => {
    if (isComplete) return;

    const newSequence = [...clickedSequence, index];
    setClickedSequence(newSequence);
    setCurrentStep(newSequence.length - 1);

    // Check if sequence is correct so far
    const isCorrectSoFar = newSequence.every((clickedIndex, i) => 
      clickedIndex === correctSequence[i]
    );

    if (!isCorrectSoFar) {
      // Wrong click - show feedback and reset
      setTimeout(() => {
        setClickedSequence([]);
        setCurrentStep(0);
      }, 1000);
      return;
    }

    // Check if sequence is complete
    if (newSequence.length === correctSequence.length) {
      setIsComplete(true);
      setShowExplanation(true);
      onComplete(true);
    }
  };

  const reset = () => {
    setClickedSequence([]);
    setCurrentStep(0);
    setIsComplete(false);
    setShowExplanation(false);
  };

  const getElementState = (index: number) => {
    const clickOrder = clickedSequence.indexOf(index);
    const isCorrectNext = correctSequence[clickedSequence.length] === index;
    const isTarget = array[index] === target;
    
    if (clickOrder !== -1) {
      return 'clicked';
    }
    if (isCorrectNext && !isComplete) {
      return 'next';
    }
    if (isTarget) {
      return 'target';
    }
    return 'default';
  };

  const getElementStyle = (state: string) => {
    switch (state) {
      case 'clicked': return { backgroundColor: '#10b981', borderColor: '#059669' }; // green
      case 'next': return { backgroundColor: '#f59e0b', borderColor: '#d97706' }; // amber
      case 'target': return { backgroundColor: '#ef4444', borderColor: '#dc2626' }; // red
      default: return { backgroundColor: '#6b7280', borderColor: '#4b5563' }; // gray
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      
      {/* Array Visualization */}
      <View style={styles.arrayContainer}>
        <View style={styles.arrayRow}>
          {array.map((value, index) => {
            const state = getElementState(index);
            const elementStyle = getElementStyle(state);
            
            return (
              <Pressable
                key={index}
                style={[
                  styles.arrayElement,
                  elementStyle,
                  state === 'next' && styles.pulseAnimation,
                  isComplete && styles.disabled
                ]}
                onPress={() => handleElementClick(index)}
                disabled={isComplete}
              >
                <Text style={styles.elementText}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        
        {/* Array Indices */}
        <View style={styles.arrayRow}>
          {array.map((_, index) => (
            <View key={index} style={styles.indexContainer}>
              <Text style={styles.indexText}>{index}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          {correctSequence.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index < clickedSequence.length && styles.progressDotCompleted,
                index === clickedSequence.length && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Step {clickedSequence.length} of {correctSequence.length}
        </Text>
      </View>

      {/* Target Info */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetText}>
          Looking for: <Text style={styles.targetValue}>{target}</Text>
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6b7280' }]} />
            <Text style={styles.legendText}>Unvisited</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Next to click</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Visited</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Target value</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Pressable
          onPress={reset}
          style={[
            styles.resetButton,
            clickedSequence.length === 0 && styles.resetButtonDisabled
          ]}
          disabled={clickedSequence.length === 0}
        >
          <Text style={[
            styles.resetButtonText,
            clickedSequence.length === 0 && styles.resetButtonTextDisabled
          ]}>
            Reset
          </Text>
        </Pressable>
      </View>

      {/* Explanation */}
      {showExplanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}

      {/* Feedback */}
      {isComplete && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackRow}>
            <MaterialIcons name="check-circle" size={20} color="#10b981" />
            <Text style={styles.feedbackText}>
              Perfect! You traced the binary search correctly!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  arrayContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  arrayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrayElement: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  pulseAnimation: {
    // Note: React Native doesn't have CSS animations, so this is just styling
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  elementText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  indexContainer: {
    width: 50,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  indexText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
  },
  progressDotCurrent: {
    backgroundColor: '#f59e0b',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  targetText: {
    fontSize: 18,
    color: '#374151',
  },
  targetValue: {
    fontWeight: 'bold',
    color: '#ef4444',
  },
  legendContainer: {
    marginBottom: 24,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonTextDisabled: {
    color: '#9ca3af',
  },
  explanationContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#166534',
    marginLeft: 8,
  },
});

export default InteractiveVisualizationQuestion; 