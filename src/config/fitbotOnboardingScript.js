import { buildTimezoneOptions, detectBrowserTimezone } from '@/utils/timezoneUtils';
import { fitbotGoalWeightWarning } from '@/utils/goalWeightConsistency';

export const FITBOT_NAME = 'FitBot';

export const HOME_INTRO_LINES = [
  "Hi! I'm your fit bot. 💪",
  "You can call me FitBot for now — my creator hasn't named me yet. (I'm lobbying for \"Captain Squat.\")",
  "I'm here to coach you, roast you gently, and pretend burpees are fun.",
  "Already have an account? Log in and we'll pick up where you left off.",
  "New here? Create an account and I'll interrogate—I mean, *interview* you. It'll be fun. Probably."
];

export const GOAL_QUIPS = {
  'weight-loss': "Ah, the classic \"abs by summer\" arc. Respect.",
  'muscle-gain': "Bulk season? I'll pretend I didn't see that second pizza.",
  'endurance': "Cardio? I promise not to say \"just one more mile\" every mile.",
  'strength': 'Heavy things go up. Ego may also go up. Both are fine.',
  'flexibility': 'Touching your toes is a personality trait now.',
  'general-fitness': "General fitness — the Swiss Army knife of goals. Chef's kiss."
};

export const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength', emoji: '🏋️' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'hiit', label: 'HIIT', emoji: '🔥' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'pilates', label: 'Pilates', emoji: '✨' },
  { value: 'bodyweight', label: 'Bodyweight', emoji: '🤸' },
  { value: 'running', label: 'Running', emoji: '👟' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  { value: 'crossfit', label: 'CrossFit', emoji: '⚡' }
];

export const DIETARY_TYPES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'dairy-free', label: 'Dairy-free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low-carb', label: 'Low-carb' },
  { value: 'low-fat', label: 'Low-fat' }
];

export const WEEKDAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

export const TIME_SLOTS = [
  { value: 'early-morning', label: 'Early bird (5–8am)' },
  { value: 'morning', label: 'Morning (8–11am)' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night owl' }
];

function ctxName(ctx) {
  return ctx.preferredName || ctx.firstName || 'friend';
}

export function createInitialFormData() {
  return {
    preferredName: '',
    gender: '',
    birthdate: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    fitnessLevel: '',
    primaryGoal: '',
    targetWeight: '',
    weeklyWorkouts: '',
    workoutPreferences: [],
    dietaryRestrictions: [],
    workoutLocation: '',
    preferredTimes: [],
    availableDays: [],
    sessionDuration: '',
    timezone: detectBrowserTimezone(),
    targetAreas: []
  };
}

export function buildOnboardingSteps() {
  const timezoneOptions = buildTimezoneOptions(detectBrowserTimezone());

  return [
    {
      id: 'welcome',
      autoAdvance: true,
      delayMs: 900,
      messages: (ctx) => [
        `Alright ${ctxName(ctx)}, let's get you set up!`,
        "I'll ask a few questions — answer like we're texting, not like you're at the DMV."
      ]
    },
    {
      id: 'preferredName',
      field: 'preferredName',
      messages: () => [
        "First things first: what should I call you?",
        "(Your government name works too, but nicknames are cooler.)"
      ],
      inputType: 'text',
      placeholder: 'Your name or nickname',
      validate: (v) => v && v.trim().length >= 1,
      formatAnswer: (v) => v.trim()
    },
    {
      id: 'birthdate',
      field: 'birthdate',
      messages: (ctx) => [
        `Nice to meet you, ${ctxName(ctx)}! 🎂`,
        "What's your date of birth? (I need it for age-appropriate suffering—I mean, programming.)"
      ],
      inputType: 'date',
      validate: (v) => !!v,
      formatAnswer: (v) => v
    },
    {
      id: 'gender',
      field: 'gender',
      messages: () => [
        "Hmm… I hate to ask this, but may I know your gender?",
        "Only so I can tailor plans — zero judgment, full support."
      ],
      inputType: 'choice',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
      ],
      validate: (v) => !!v
    },
    {
      id: 'weight',
      field: 'weight',
      messages: () => [
        "Ok, scale confession time. What's your weight?",
        "(In kg — yes, metric. I'm modern like that. 🇺🇸 users: Google exists.)"
      ],
      inputType: 'number',
      placeholder: 'Weight in kg',
      step: '0.1',
      min: 0,
      validate: (v) => v && Number(v) > 0,
      formatAnswer: (v) => `${v} kg`
    },
    {
      id: 'height',
      field: 'height',
      messages: () => [
        "Ok now I'm getting chatty — how tall are you?",
        "Cm or feet & inches, your pick. I won't do trigonometry out loud."
      ],
      inputType: 'height',
      validate: (v, form) => form.height && Number(form.height) > 0,
      formatAnswer: (v, form) =>
        form.heightUnit === 'ft'
          ? `${form.heightFeetDisplay || '?'}' ${form.heightInchesDisplay || '?'}"`
          : `${v} cm`
    },
    {
      id: 'fitnessLevel',
      field: 'fitnessLevel',
      messages: (ctx) => [
        `Thanks ${ctxName(ctx)} — basic stats: unlocked. ✅`,
        "How would you rate your current fitness level? Be honest. I've seen beginners out-lift gym bros."
      ],
      inputType: 'choice',
      options: [
        { value: 'beginner', label: '🐣 Beginner — just starting' },
        { value: 'intermediate', label: '💪 Intermediate — I show up' },
        { value: 'advanced', label: '🔥 Advanced — regular lifter' },
        { value: 'expert', label: '🏆 Expert — basically a weapon' }
      ],
      validate: (v) => !!v
    },
    {
      id: 'primaryGoal',
      field: 'primaryGoal',
      messages: () => [
        "Now the fun part — what's the mission?",
        "Pick your main goal. I'll try not to cry when you pick cardio."
      ],
      inputType: 'choice',
      options: [
        { value: 'weight-loss', label: '🔥 Lose weight', quip: GOAL_QUIPS['weight-loss'] },
        { value: 'muscle-gain', label: '💪 Build muscle', quip: GOAL_QUIPS['muscle-gain'] },
        { value: 'endurance', label: '🏃 Endurance', quip: GOAL_QUIPS['endurance'] },
        { value: 'strength', label: '🏋️ Strength', quip: GOAL_QUIPS['strength'] },
        { value: 'flexibility', label: '🧘 Flexibility', quip: GOAL_QUIPS['flexibility'] },
        { value: 'general-fitness', label: '✨ General fitness', quip: GOAL_QUIPS['general-fitness'] }
      ],
      validate: (v) => !!v,
      onAnswer: (value, option) => option?.quip || null
    },
    {
      id: 'targetWeight',
      field: 'targetWeight',
      optional: true,
      messages: (ctx) => {
        const goal = ctx.primaryGoal;
        if (goal === 'muscle-gain' || goal === 'strength') {
          return [
            'Got a target weight in mind? (kg)',
            'Muscle/strength goals usually stay near your current weight (or slightly up). A big drop is more of a fat-loss plan — skip if you are not chasing a number.'
          ];
        }
        if (goal === 'weight-loss') {
          return [
            'Got a target weight in mind? (kg)',
            'A realistic lower target helps me coach the cut. Skip if you are not targeting a number.'
          ];
        }
        return [
          'Got a target weight in mind? (kg)',
          "Skip if you're happy where you are — scales are optional villains."
        ];
      },
      inputType: 'number',
      placeholder: 'Target kg (optional)',
      step: '0.1',
      min: 0,
      allowSkip: true,
      validate: () => true,
      formatAnswer: (v) => (v ? `${v} kg` : 'No target — vibing'),
      onAnswer: (value, _opt, form) =>
        fitbotGoalWeightWarning(form?.primaryGoal, form?.weight, value)
    },
    {
      id: 'weeklyWorkouts',
      field: 'weeklyWorkouts',
      messages: () => [
        "Real talk: how many days per week can you actually train?",
        "Not \"I'll do 7\" and then ghost me on Wednesday. We've all been there."
      ],
      inputType: 'choice',
      options: [
        { value: '1-2', label: '1–2 days (baby steps)' },
        { value: '3-4', label: '3–4 days (solid)' },
        { value: '5-6', label: '5–6 days (beast mode)' },
        { value: '7+', label: '7+ (do you sleep?)' }
      ],
      validate: (v) => !!v
    },
    {
      id: 'workoutPreferences',
      field: 'workoutPreferences',
      messages: () => [
        "What kind of workouts make you feel alive?",
        "Pick all that apply — variety is the spice of gains."
      ],
      inputType: 'multi',
      options: WORKOUT_TYPES,
      validate: (v) => Array.isArray(v) && v.length > 0
    },
    {
      id: 'workoutLocation',
      field: 'workoutLocation',
      messages: () => [
        "Where do you usually train?",
        "Home, gym, park, or \"wherever my motivation finds me.\""
      ],
      inputType: 'choice',
      options: [
        { value: 'home', label: '🏠 Home' },
        { value: 'gym', label: '🏋️ Gym' },
        { value: 'outdoors', label: '🌳 Outdoors' },
        { value: 'mixed', label: '🔀 Mix of everything' }
      ],
      validate: (v) => !!v
    },
    {
      id: 'dietaryRestrictions',
      field: 'dietaryRestrictions',
      optional: true,
      messages: () => [
        "Any dietary restrictions I should know about?",
        "Select any — or skip if you eat everything. (Jealous.)"
      ],
      inputType: 'multi',
      options: DIETARY_TYPES,
      allowSkip: true,
      validate: () => true
    },
    {
      id: 'availableDays',
      field: 'availableDays',
      messages: (ctx) => [
        `${ctxName(ctx)}, let's plan the week.`,
        "Which days are fair game for workouts?"
      ],
      inputType: 'multi',
      options: WEEKDAYS,
      validate: (v) => Array.isArray(v) && v.length > 0
    },
    {
      id: 'preferredTimes',
      field: 'preferredTimes',
      messages: () => [
        "When's your prime workout window?",
        "I'll send reminders then — not at 5am unless you asked for pain."
      ],
      inputType: 'multi',
      options: TIME_SLOTS,
      validate: (v) => Array.isArray(v) && v.length > 0
    },
    {
      id: 'sessionDuration',
      field: 'sessionDuration',
      messages: () => [
        "How long can you commit per session?",
        "Honest answers only — 15 minutes still counts. Hero behavior."
      ],
      inputType: 'choice',
      options: [
        { value: '15-30', label: '15–30 min (snack workout)' },
        { value: '30-45', label: '30–45 min (classic)' },
        { value: '45-60', label: '45–60 min (main character)' },
        { value: '60+', label: '60+ min (marathon session)' }
      ],
      validate: (v) => !!v
    },
    {
      id: 'timezone',
      field: 'timezone',
      messages: () => [
        "Last logistics thing: your timezone.",
        "So I don't ping you for squats at 3am. Unless you're into that."
      ],
      inputType: 'select',
      options: timezoneOptions.map((tz) => ({ value: tz.id, label: tz.label })),
      validate: (v) => !!v
    },
    {
      id: 'finish',
      autoAdvance: true,
      delayMs: 700,
      messages: (ctx) => [
        `That's everything, ${ctxName(ctx)}! 🎉`,
        "I'm building your profile and cooking up your first workout. Brace for motivational spam."
      ]
    }
  ];
}
