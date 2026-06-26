/**
 * Maps backend TodayWorkoutResponse to WorkoutCard props.
 */
export function mapTodayWorkoutToCard(response) {
  if (!response?.hasTodayPlan || !response?.todayPlan) {
    return null;
  }

  const plan = response.todayPlan;
  const completed = response.status === 'COMPLETED';
  const sessionType = plan.sessionType || 'Workout';

  const exercises = (plan.exercises || []).map((ex) => ({
    name: ex.name || 'Exercise',
    sets: ex.sets ?? '-',
    reps: ex.reps ?? '-'
  }));

  return {
    id: `today-${response.date}`,
    title: formatSessionType(sessionType),
    description: response.currentFocus || '',
    category: mapCategory(sessionType),
    duration: plan.durationMin || response.completedWorkout?.durationMin || 0,
    exercises,
    completed,
    completedAt:
      completed && response.completedWorkout?.updatedAt
        ? response.completedWorkout.updatedAt
        : null
  };
}

function formatSessionType(sessionType) {
  if (!sessionType) return 'Workout';
  return sessionType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapCategory(sessionType) {
  const normalized = (sessionType || '').toLowerCase();
  if (normalized.includes('cardio') || normalized.includes('run')) return 'cardio';
  if (normalized.includes('yoga')) return 'yoga';
  if (normalized.includes('hiit')) return 'hiit';
  if (normalized.includes('flex') || normalized.includes('mobility')) return 'flexibility';
  if (normalized === 'rest') return 'flexibility';
  return 'strength';
}

/**
 * Aggregates workout history into chart series for ProgressChart.
 * @param {Array} history - WorkoutHistoryItem[] from API
 * @param {string} period - 'week' | 'month' | 'quarter' | 'year'
 */
export function aggregateActivityFromHistory(history, period = 'week') {
  const items = history || [];
  const labels = [];
  const data = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'week') {
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = toDateKey(date);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(sumMinutesForDate(items, key));
    }
  } else if (period === 'month') {
    for (let i = 29; i >= 0; i -= 3) {
      const end = new Date(today);
      end.setDate(end.getDate() - i);
      const start = new Date(end);
      start.setDate(start.getDate() - 2);
      labels.push(end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      data.push(sumMinutesInRange(items, start, end));
    }
  } else if (period === 'quarter') {
    for (let i = 84; i >= 0; i -= 7) {
      const end = new Date(today);
      end.setDate(end.getDate() - i);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      labels.push(end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      data.push(sumMinutesInRange(items, start, end));
    }
  } else {
    for (let i = 11; i >= 0; i -= 1) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      labels.push(monthStart.toLocaleDateString('en-US', { month: 'short' }));
      data.push(sumMinutesInRange(items, monthStart, monthEnd));
    }
  }

  const hasAnyData = data.some((v) => v > 0);

  return {
    labels,
    data,
    label: 'Active Minutes',
    hasAnyData
  };
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

function sumMinutesForDate(items, dateKey) {
  return items
    .filter((w) => w.workoutDate === dateKey)
    .reduce((sum, w) => sum + (w.durationMin || 0), 0);
}

function sumMinutesInRange(items, start, end) {
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  return items
    .filter((w) => w.workoutDate >= startKey && w.workoutDate <= endKey)
    .reduce((sum, w) => sum + (w.durationMin || 0), 0);
}
