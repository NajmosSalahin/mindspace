import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../api/client';

const MindSpaceContext = createContext(null);

// ── Initial State ─────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  tasks: [],
  energy: null,
  analytics: null,
  focusTask: null,       // task currently in focus mode
  loading: { auth: true, tasks: false, energy: false },
  errors: {},
  notification: null
};

// ── Reducer ───────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, token: action.token, loading: { ...state.loading, auth: false } };
    case 'LOGOUT':
      return { ...initialState, loading: { ...initialState.loading, auth: false } };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_TASKS':
      return { ...state, tasks: action.tasks };
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t._id === action.task._id ? { ...t, ...action.task } : t) };
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t._id !== action.id) };
    case 'SET_ENERGY':
      return { ...state, energy: action.energy };
    case 'UPDATE_ENERGY':
      return { ...state, energy: { ...state.energy, ...action.updates }, user: state.user ? { ...state.user, energyProfile: { ...state.user.energyProfile, currentEnergy: action.updates.currentEnergy ?? state.user?.energyProfile?.currentEnergy } } : state.user };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.analytics };
    case 'SET_FOCUS_TASK':
      return { ...state, focusTask: action.task };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.notification };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────
export function MindSpaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const notify = useCallback((message, type = 'info') => {
    dispatch({ type: 'SET_NOTIFICATION', notification: { message, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3500);
  }, []);

  // Boot: restore session
  useEffect(() => {
    const token = localStorage.getItem('ms_token');
    const user = localStorage.getItem('ms_user');
    if (token && user) {
      dispatch({ type: 'SET_AUTH', user: JSON.parse(user), token });
    } else {
      dispatch({ type: 'SET_AUTH', user: null, token: null });
    }
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('ms_token', data.token);
    localStorage.setItem('ms_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_AUTH', user: data.user, token: data.token });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ms_token', data.token);
    localStorage.setItem('ms_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_AUTH', user: data.user, token: data.token });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateBrainState = async (brainState) => {
    const { data } = await api.patch('/auth/brain-state', { brainState });
    dispatch({ type: 'SET_USER', user: { ...state.user, brainState: data.brainState } });
    dispatch({ type: 'UPDATE_ENERGY', updates: { currentEnergy: data.energy } });
    notify(`Brain state updated to ${brainState}`, 'success');
  };

  // ── Tasks ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', key: 'tasks', value: true });
    try {
      const { data } = await api.get('/tasks', { params });
      dispatch({ type: 'SET_TASKS', tasks: data });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'tasks', value: false });
    }
  }, []);

  const createTask = async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    dispatch({ type: 'ADD_TASK', task: data.task });
    if (data.willOverdraw) {
      notify(`⚠️ This task may overdraw your energy budget!`, 'warning');
    } else {
      notify('Task added to your MindSpace', 'success');
    }
    return data;
  };

  const updateTask = async (id, updates) => {
    const { data } = await api.patch(`/tasks/${id}`, updates);
    dispatch({ type: 'UPDATE_TASK', task: data });
    return data;
  };

  const completeTask = async (id, actualDuration) => {
    const { data } = await api.post(`/tasks/${id}/complete`, { actualDuration });
    dispatch({ type: 'UPDATE_TASK', task: data.task });
    dispatch({ type: 'UPDATE_ENERGY', updates: { currentEnergy: data.remainingEnergy } });
    dispatch({ type: 'SET_USER', user: { ...state.user, energyProfile: { ...state.user?.energyProfile, currentEnergy: data.remainingEnergy } } });
    dispatch({ type: 'SET_FOCUS_TASK', task: null });
    notify(`✓ Task complete! Used ${data.energyConsumed} energy units`, 'success');
    return data;
  };

  const deferTask = async (id) => {
    const { data } = await api.post(`/tasks/${id}/defer`);
    dispatch({ type: 'UPDATE_TASK', task: data.task });
    dispatch({ type: 'SET_USER', user: { ...state.user, cognitiveDebt: data.totalDebt } });
    notify(`Task deferred (+${Math.round(data.debtGenerated)} cognitive debt)`, 'warning');
    return data;
  };

  const startTask = async (id) => {
    const { data } = await api.post(`/tasks/${id}/start`);
    dispatch({ type: 'UPDATE_TASK', task: data });
    dispatch({ type: 'SET_FOCUS_TASK', task: data });
    return data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    dispatch({ type: 'REMOVE_TASK', id });
    notify('Task removed', 'info');
  };

  // ── Energy ─────────────────────────────────────────────────────────────
  const fetchEnergy = useCallback(async () => {
    const { data } = await api.get('/energy');
    dispatch({ type: 'SET_ENERGY', energy: data });
    return data;
  }, []);

  const takeBreak = async (minutes) => {
    const { data } = await api.post('/energy/recover', { minutes });
    dispatch({ type: 'UPDATE_ENERGY', updates: { currentEnergy: data.energyAfter } });
    dispatch({ type: 'SET_USER', user: { ...state.user, cognitiveDebt: data.cognitiveDebt, energyProfile: { ...state.user?.energyProfile, currentEnergy: data.energyAfter } } });
    notify(`+${data.recoveryAmount} energy recovered 🌿`, 'success');
    return data;
  };

  // ── Analytics ──────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async (days = 7) => {
    const { data } = await api.get('/analytics/overview', { params: { days } });
    dispatch({ type: 'SET_ANALYTICS', analytics: data });
    return data;
  }, []);

  return (
    <MindSpaceContext.Provider value={{
      ...state,
      register, login, logout, updateBrainState,
      fetchTasks, createTask, updateTask, completeTask, deferTask, startTask, deleteTask,
      fetchEnergy, takeBreak,
      fetchAnalytics,
      dispatch, notify
    }}>
      {children}
    </MindSpaceContext.Provider>
  );
}

export const useMindSpace = () => {
  const ctx = useContext(MindSpaceContext);
  if (!ctx) throw new Error('useMindSpace must be used within MindSpaceProvider');
  return ctx;
};
