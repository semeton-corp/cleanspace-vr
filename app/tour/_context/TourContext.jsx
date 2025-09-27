"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../_context/AuthContext';
import { dbService } from '../../../lib/database';

const TourContext = createContext();

export function TourProvider({ children }) {
  const { user, sessionId } = useAuth();
  const [currentPos, setCurrentPos] = useState(1);
  const [sceneScore, setSceneScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [quizCompleted, setQuizCompleted] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [timerFrozen, setTimerFrozen] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [finishButtonClicked, setFinishButtonClicked] = useState(false);
  const maxPos = 7; // Updated to 7 positions
  const quizPositions = [2, 3, 5]; // Quiz positions: Pos 2, 3, and 5

  // Initialize data without starting timer
  useEffect(() => {
    const initializeData = () => {
      const savedTourCompleted = localStorage.getItem('tour_completed');
      const savedFinalTime = localStorage.getItem('tour_final_time');
      const savedFinishClicked = localStorage.getItem('finish_button_clicked');
      const startTime = localStorage.getItem('tour_start_time');
      
      // Check if tour was already completed
      if (savedTourCompleted === 'true' && savedFinishClicked === 'true') {
        setTourCompleted(true);
        setTimerFrozen(true);
        setTimerStarted(true);
        setFinishButtonClicked(true);
        if (savedFinalTime) {
          setTimeRemaining(parseInt(savedFinalTime));
        }
      } else if (startTime) {
        // Tour was already started, calculate elapsed time
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - parseInt(startTime)) / 1000);
        const remaining = Math.max(0, 600 - elapsedSeconds);
        setTimeRemaining(remaining);
        setTimerStarted(true);
        setTimerFrozen(false);
        setTourCompleted(false);
        setFinishButtonClicked(false);
      } else {
        // Timer not started yet
        setTimeRemaining(600);
        setTimerStarted(false);
        setTimerFrozen(false);
        setTourCompleted(false);
        setFinishButtonClicked(false);
      }

      // Load other saved data
      const savedTotalScore = localStorage.getItem('tour_total_score');
      const savedQuizCompleted = localStorage.getItem('tour_quiz_completed');
      
      if (savedTotalScore) {
        setTotalScore(parseInt(savedTotalScore));
      }
      
      if (savedQuizCompleted) {
        try {
          setQuizCompleted(JSON.parse(savedQuizCompleted));
        } catch (e) {
          console.error('Error parsing saved quiz data:', e);
        }
      }

      setIsInitialized(true);
    };

    const timer = setTimeout(initializeData, 100);
    return () => clearTimeout(timer);
  }, []);

  // Start timer when reaching Pos 1
  const startTimer = () => {
    if (!timerStarted && !tourCompleted) {
      const currentTime = Date.now();
      localStorage.setItem('tour_start_time', currentTime.toString());
      setTimerStarted(true);
      console.log('Timer started at Pos 1');
    }
  };

  // Timer countdown - only run if started, not frozen, and not completed
  useEffect(() => {
    if (!isInitialized || !timerStarted || timeRemaining <= 0 || timerFrozen || finishButtonClicked) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isInitialized, timerStarted, timerFrozen, finishButtonClicked]);

  // Save data to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('tour_total_score', totalScore.toString());
  }, [totalScore, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('tour_quiz_completed', JSON.stringify(quizCompleted));
  }, [quizCompleted, isInitialized]);

  // Check if all quizzes are completed (but don't stop timer yet)
  useEffect(() => {
    if (!isInitialized || finishButtonClicked) return;
    
    const allQuizzesComplete = quizPositions.every(pos => quizCompleted[pos]);
    const completedQuizCount = quizPositions.filter(pos => quizCompleted[pos]).length;
    
    console.log('Quiz check:', { 
      allQuizzesComplete, 
      completedQuizCount, 
      requiredQuizzes: quizPositions.length,
      quizCompleted 
    });
    
    // Only mark tour as ready to complete, but don't stop timer yet
    if (allQuizzesComplete && completedQuizCount === quizPositions.length) {
      console.log('All quizzes completed, tour ready to finish but timer still running');
      setTourCompleted(true);
      localStorage.setItem('tour_completed', 'true');
    }
  }, [quizCompleted, isInitialized, finishButtonClicked, quizPositions]);

  const completeQuiz = (posId, score) => {
    console.log(`Completing quiz for pos ${posId} with score ${score}`);
    
    const newQuizCompleted = {
      ...quizCompleted,
      [posId]: true
    };
    
    setQuizCompleted(newQuizCompleted);
    setTotalScore(prev => prev + score);
    setSceneScore(score);
    
    // Just log completion, don't stop timer here
    const completedRequiredQuizzes = quizPositions.filter(pos => newQuizCompleted[pos]).length;
    console.log('Completed required quizzes:', completedRequiredQuizzes, 'of', quizPositions.length);
  };

  const resetTour = () => {
    localStorage.removeItem('tour_start_time');
    localStorage.removeItem('tour_total_score');
    localStorage.removeItem('tour_quiz_completed');
    localStorage.removeItem('tour_completed');
    localStorage.removeItem('tour_final_time');
    localStorage.removeItem('finish_button_clicked');
    
    setCurrentPos(1);
    setSceneScore(0);
    setTotalScore(0);
    setTimeRemaining(600);
    setQuizCompleted({});
    setTourCompleted(false);
    setTimerFrozen(false);
    setTimerStarted(false);
    setFinishButtonClicked(false);
  };

  // New function to handle finish button click
  const handleFinishTour = async () => {
    console.log('Finish button clicked, stopping timer at:', timeRemaining);
    setFinishButtonClicked(true);
    setTimerFrozen(true);
    localStorage.setItem('finish_button_clicked', 'true');
    localStorage.setItem('tour_final_time', timeRemaining.toString());

    // Save tour completion data to database
    if (user && sessionId) {
      const completionData = {
        totalScore,
        timeTaken: 600 - timeRemaining, // Time taken in seconds
        tourCompleted: true,
        completedAt: new Date().toISOString(),
        sessionData: {
          currentPos,
          quizCompleted,
          sceneScore,
          finalTimeRemaining: timeRemaining
        }
      };

      try {
        const result = await dbService.updateUserSession(user.nim, completionData);
        if (result.success) {
          console.log('Tour completion data saved successfully');
        } else {
          console.error('Failed to save tour completion data:', result.error);
        }
      } catch (error) {
        console.error('Error saving tour completion data:', error);
      }
    }
  };

  const completeTourAndReset = () => {
    setTimeout(() => {
      resetTour();
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    currentPos,
    setCurrentPos,
    sceneScore,
    setSceneScore,
    totalScore,
    setTotalScore,
    timeRemaining,
    quizCompleted,
    tourCompleted,
    timerFrozen,
    timerStarted,
    finishButtonClicked,
    maxPos,
    quizPositions,
    completeQuiz,
    resetTour,
    completeTourAndReset,
    startTimer,
    handleFinishTour,
    formatTime,
    isInitialized
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}