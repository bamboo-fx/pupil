// Required dependencies: npm install framer-motion
// This component demonstrates the interactive visualization question type
import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// For now, using div instead of motion.div for compatibility
const motion = { div: 'div' as any };
const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

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

  const getElementColor = (state: string) => {
    switch (state) {
      case 'clicked': return '#10b981'; // green
      case 'next': return '#f59e0b'; // amber
      case 'target': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{question}</h2>
      
      {/* Array Visualization */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {array.map((value, index) => (
            <motion.div
              key={index}
              className={`
                w-16 h-16 rounded-lg flex items-center justify-center
                text-white font-bold text-lg cursor-pointer
                border-2 border-gray-300 hover:border-gray-400
                transition-all duration-200
                ${isComplete ? 'cursor-not-allowed' : 'hover:scale-105'}
              `}
              style={{ 
                backgroundColor: getElementColor(getElementState(index))
              }}
              onClick={() => handleElementClick(index)}
              whileHover={{ scale: isComplete ? 1 : 1.05 }}
              whileTap={{ scale: isComplete ? 1 : 0.95 }}
              animate={{
                scale: getElementState(index) === 'next' ? [1, 1.1, 1] : 1,
                boxShadow: getElementState(index) === 'next' 
                  ? '0 0 20px rgba(245, 158, 11, 0.5)' 
                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ 
                scale: { duration: 0.6, repeat: getElementState(index) === 'next' ? Infinity : 0 }
              }}
            >
              {value}
            </motion.div>
          ))}
        </div>
        
        {/* Array Indices */}
        <div className="flex items-center justify-center space-x-2">
          {array.map((_, index) => (
            <div key={index} className="w-16 text-center text-sm text-gray-500">
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2">
          {correctSequence.map((_, index) => (
            <div
              key={index}
              className={`
                w-4 h-4 rounded-full
                ${index < clickedSequence.length 
                  ? 'bg-green-500' 
                  : index === clickedSequence.length 
                    ? 'bg-amber-500' 
                    : 'bg-gray-300'
                }
              `}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          Step {clickedSequence.length} of {correctSequence.length}
        </p>
      </div>

      {/* Target Info */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-700">
          Looking for: <span className="font-bold text-red-600">{target}</span>
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-sm">Unvisited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-sm">Next to click</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Target value</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          disabled={clickedSequence.length === 0}
        >
          Reset
        </button>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <h3 className="font-bold text-green-800 mb-2">Explanation:</h3>
            <p className="text-green-700">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mt-4"
        >
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Perfect! You traced the binary search correctly!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveVisualizationQuestion; 