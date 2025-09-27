import { supabase } from './supabase';

export const dbService = {
  // Save user session data
  async saveUserSession(userData) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([
          {
            nim: userData.nim,
            full_name: userData.fullName,
            email: userData.email,
            fakultas: userData.fakultas,
            program_studi: userData.programStudi,
            login_time: userData.loginTime,
            total_score: userData.totalScore || 0,
            time_taken: userData.timeTaken || 0,
            tour_completed: userData.tourCompleted || false,
            session_data: userData
          }
        ])
        .select();

      if (error) {
        console.error('Error saving user session:', error);
        return { success: false, error };
      }

      console.log('User session saved successfully:', data);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in saveUserSession:', error);
      return { success: false, error };
    }
  },

  // Update user session with tour completion data
  async updateUserSession(nim, updateData) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          total_score: updateData.totalScore,
          time_taken: updateData.timeTaken,
          tour_completed: updateData.tourCompleted,
          completed_at: updateData.completedAt,
          session_data: updateData.sessionData
        })
        .eq('nim', nim)
        .eq('tour_completed', false) // Only update incomplete sessions
        .select();

      if (error) {
        console.error('Error updating user session:', error);
        return { success: false, error };
      }

      console.log('User session updated successfully:', data);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in updateUserSession:', error);
      return { success: false, error };
    }
  },

  // Get user sessions
  async getUserSessions(nim = null) {
    try {
      let query = supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (nim) {
        query = query.eq('nim', nim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting user sessions:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getUserSessions:', error);
      return { success: false, error };
    }
  },

  // Save quiz answers
  async saveQuizAnswers(sessionId, quizData) {
    try {
      const { data, error } = await supabase
        .from('quiz_answers')
        .insert([
          {
            session_id: sessionId,
            position: quizData.position,
            answers: quizData.answers,
            score: quizData.score,
            time_taken: quizData.timeTaken
          }
        ])
        .select();

      if (error) {
        console.error('Error saving quiz answers:', error);
        return { success: false, error };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in saveQuizAnswers:', error);
      return { success: false, error };
    }
  }
};
