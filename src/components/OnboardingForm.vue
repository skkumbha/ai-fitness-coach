<template>
  <div class="onboarding-form">
    <!-- Step 1: Basic Info -->
    <div v-if="step === 0" class="form-step">
      <div class="form-group">
        <label for="gender" class="form-label">Gender</label>
        <select 
          id="gender"
          :value="localFormData.gender"
          @change="updateField('gender', $event.target.value)"
          class="form-select"
          required
        >
          <option value="" disabled>Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="birthdate" class="form-label">Birth Date</label>
        <input 
          id="birthdate"
          :value="localFormData.birthdate"
          @input="updateField('birthdate', $event.target.value)"
          type="date"
          class="form-control"
          required
        />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="height" class="form-label">Height (cm)</label>
          <input 
            id="height"
            :value="localFormData.height"
            @input="updateField('height', $event.target.value)"
            type="number"
            min="0"
            step="1"
            class="form-control"
            placeholder="Height in centimeters"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="weight" class="form-label">Weight (kg)</label>
          <input 
            id="weight"
            :value="localFormData.weight"
            @input="updateField('weight', $event.target.value)"
            type="number"
            min="0"
            step="0.1"
            class="form-control"
            placeholder="Weight in kilograms"
            required
          />
        </div>
      </div>
    </div>
    
    <!-- Step 2: Fitness Goals -->
    <div v-if="step === 1" class="form-step">
      <div class="form-group">
        <label for="fitnessLevel" class="form-label">Current Fitness Level</label>
        <select 
          id="fitnessLevel"
          :value="localFormData.fitnessLevel"
          @change="updateField('fitnessLevel', $event.target.value)"
          class="form-select"
          required
        >
          <option value="" disabled>Select your fitness level</option>
          <option value="beginner">Beginner - Just starting out</option>
          <option value="intermediate">Intermediate - Some experience</option>
          <option value="advanced">Advanced - Regular exerciser</option>
          <option value="expert">Expert - Very experienced</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="primaryGoal" class="form-label">Primary Fitness Goal</label>
        <select 
          id="primaryGoal"
          :value="localFormData.primaryGoal"
          @change="updateField('primaryGoal', $event.target.value)"
          class="form-select"
          required
        >
          <option value="" disabled>Select your primary goal</option>
          <option value="weight-loss">Lose Weight</option>
          <option value="muscle-gain">Build Muscle</option>
          <option value="endurance">Improve Endurance</option>
          <option value="strength">Increase Strength</option>
          <option value="flexibility">Improve Flexibility</option>
          <option value="general-fitness">General Fitness & Health</option>
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="targetWeight" class="form-label">Target Weight (kg)</label>
          <input 
            id="targetWeight"
            :value="localFormData.targetWeight"
            @input="updateField('targetWeight', $event.target.value)"
            type="number"
            min="0"
            step="0.1"
            class="form-control"
            placeholder="Optional"
          />
          <div class="form-helper-text">Leave blank if not targeting weight change</div>
        </div>
        
        <div class="form-group">
          <label for="weeklyWorkouts" class="form-label">Weekly Workout Sessions</label>
          <select 
            id="weeklyWorkouts"
            :value="localFormData.weeklyWorkouts"
            @change="updateField('weeklyWorkouts', $event.target.value)"
            class="form-select"
            required
          >
            <option value="" disabled>Select frequency</option>
            <option value="1-2">1-2 times per week</option>
            <option value="3-4">3-4 times per week</option>
            <option value="5-6">5-6 times per week</option>
            <option value="7+">7+ times per week</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Step 3: Preferences -->
    <div v-if="step === 2" class="form-step">
      <div class="form-group">
        <label class="form-label">Workout Preferences (select all that apply)</label>
        <div class="checkbox-group">
          <div v-for="(workout, index) in workoutTypes" :key="index" class="form-checkbox">
            <input 
              :id="`workout-${workout.value}`"
              type="checkbox"
              :value="workout.value"
              :checked="localFormData.workoutPreferences && localFormData.workoutPreferences.includes(workout.value)"
              @change="updateCheckboxArray('workoutPreferences', workout.value, $event.target.checked)"
            />
            <label :for="`workout-${workout.value}`">{{ workout.label }}</label>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="workoutLocation" class="form-label">Preferred Workout Location</label>
        <select 
          id="workoutLocation"
          :value="localFormData.workoutLocation"
          @change="updateField('workoutLocation', $event.target.value)"
          class="form-select"
          required
        >
          <option value="" disabled>Select location</option>
          <option value="home">Home</option>
          <option value="gym">Gym</option>
          <option value="outdoors">Outdoors</option>
          <option value="mixed">Various / Mixed</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Dietary Restrictions (select all that apply)</label>
        <div class="checkbox-group">
          <div v-for="(diet, index) in dietaryTypes" :key="index" class="form-checkbox">
            <input 
              :id="`diet-${diet.value}`"
              type="checkbox"
              :value="diet.value"
              :checked="localFormData.dietaryRestrictions && localFormData.dietaryRestrictions.includes(diet.value)"
              @change="updateCheckboxArray('dietaryRestrictions', diet.value, $event.target.checked)"
            />
            <label :for="`diet-${diet.value}`">{{ diet.label }}</label>
          </div>
        </div>
        <div class="form-helper-text">Leave blank if you have no specific dietary restrictions</div>
      </div>
    </div>
    
    <!-- Step 4: Schedule -->
    <div v-if="step === 3" class="form-step">
      <div class="form-group">
        <label class="form-label">Available Days (select all that apply)</label>
        <div class="checkbox-group">
          <div v-for="(day, index) in weekdays" :key="index" class="form-checkbox">
            <input 
              :id="`day-${day.value}`"
              type="checkbox"
              :value="day.value"
              :checked="localFormData.availableDays && localFormData.availableDays.includes(day.value)"
              @change="updateCheckboxArray('availableDays', day.value, $event.target.checked)"
            />
            <label :for="`day-${day.value}`">{{ day.label }}</label>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Preferred Time of Day</label>
        <div class="checkbox-group">
          <div v-for="(time, index) in timeSlots" :key="index" class="form-checkbox">
            <input 
              :id="`time-${time.value}`"
              type="checkbox"
              :value="time.value"
              :checked="localFormData.preferredTimes && localFormData.preferredTimes.includes(time.value)"
              @change="updateCheckboxArray('preferredTimes', time.value, $event.target.checked)"
            />
            <label :for="`time-${time.value}`">{{ time.label }}</label>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="sessionDuration" class="form-label">Preferred Session Duration</label>
        <select 
          id="sessionDuration"
          :value="localFormData.sessionDuration"
          @change="updateField('sessionDuration', $event.target.value)"
          class="form-select"
          required
        >
          <option value="" disabled>Select duration</option>
          <option value="15-30">15-30 minutes</option>
          <option value="30-45">30-45 minutes</option>
          <option value="45-60">45-60 minutes</option>
          <option value="60+">60+ minutes</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingForm',
  props: {
    step: {
      type: Number,
      required: true
    },
    formData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localFormData: { ...this.formData },
      workoutTypes: [
        { value: 'strength', label: 'Strength Training' },
        { value: 'cardio', label: 'Cardio' },
        { value: 'hiit', label: 'High-Intensity Interval Training (HIIT)' },
        { value: 'yoga', label: 'Yoga' },
        { value: 'pilates', label: 'Pilates' },
        { value: 'bodyweight', label: 'Bodyweight Exercises' },
        { value: 'running', label: 'Running' },
        { value: 'cycling', label: 'Cycling' },
        { value: 'swimming', label: 'Swimming' },
        { value: 'crossfit', label: 'CrossFit' }
      ],
      dietaryTypes: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'gluten-free', label: 'Gluten-Free' },
        { value: 'dairy-free', label: 'Dairy-Free' },
        { value: 'keto', label: 'Keto' },
        { value: 'paleo', label: 'Paleo' },
        { value: 'low-carb', label: 'Low-Carb' },
        { value: 'low-fat', label: 'Low-Fat' }
      ],
      weekdays: [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' }
      ],
      timeSlots: [
        { value: 'early-morning', label: 'Early Morning (5am-8am)' },
        { value: 'morning', label: 'Morning (8am-11am)' },
        { value: 'midday', label: 'Midday (11am-2pm)' },
        { value: 'afternoon', label: 'Afternoon (2pm-5pm)' },
        { value: 'evening', label: 'Evening (5pm-8pm)' },
        { value: 'night', label: 'Night (8pm-11pm)' }
      ]
    };
  },
  watch: {
    // Watch for changes in step to reset form validation
    step() {
      this.localFormData = { ...this.formData };
    },
    
    // Watch for changes in form data from parent (only when not from local changes)
    formData: {
      handler(newVal, oldVal) {
        // Only update if the change didn't originate from localFormData
        if (JSON.stringify(newVal) !== JSON.stringify(this.localFormData)) {
          this.localFormData = { ...newVal };
        }
      },
      deep: true
    }
  },
  
  methods: {
    // Method to handle local form changes and emit to parent
    handleFormChange() {
      this.$emit('update:form', { ...this.localFormData });
    },
    
    // Method to update individual form fields
    updateField(key, value) {
      this.localFormData[key] = value;
      this.handleFormChange();
    },
    
    // Method to update checkbox arrays
    updateCheckboxArray(key, value, checked) {
      const currentArray = this.localFormData[key] || [];
      if (checked) {
        if (!currentArray.includes(value)) {
          this.localFormData[key] = [...currentArray, value];
        }
      } else {
        this.localFormData[key] = currentArray.filter(item => item !== value);
      }
      this.handleFormChange();
    }
  }
};
</script>

<style scoped>
.onboarding-form {
  width: 100%;
}

.form-step {
  animation: fadeIn 0.3s ease-in-out;
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-color);
}

.form-control, .form-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
}

.form-helper-text {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.form-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  min-width: 200px;
}

.form-checkbox input[type="checkbox"] {
  margin-right: var(--spacing-xs);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-checkbox {
    min-width: 100%;
  }
}
</style>