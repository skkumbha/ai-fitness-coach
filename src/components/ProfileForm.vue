<template>
  <div class="profile-form">
    <form @submit.prevent="handleSubmit">
      <!-- Personal Information Form -->
      <div v-if="formType === 'personal'" class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input 
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input 
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-control"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input 
            id="email"
            v-model="formData.email"
            type="email"
            class="form-control"
            required
            disabled
          />
          <div class="form-text">Email address cannot be changed</div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="gender" class="form-label">Gender</label>
            <select id="gender" v-model="formData.gender" class="form-select">
              <option value="">Select gender</option>
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
              v-model="formData.birthdate"
              type="date"
              class="form-control"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="height" class="form-label">Height (cm)</label>
            <input 
              id="height"
              v-model="formData.height"
              type="number"
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="weight" class="form-label">Weight (kg)</label>
            <input 
              id="weight"
              v-model="formData.weight"
              type="number"
              min="0"
              step="0.1"
              class="form-control"
            />
          </div>
        </div>
      </div>
      
      <!-- Fitness Goals Form -->
      <div v-if="formType === 'goals'" class="form-section">
        <div class="form-group">
          <label for="primaryGoal" class="form-label">Primary Fitness Goal</label>
          <select id="primaryGoal" v-model="formData.primaryGoal" class="form-select">
            <option value="">Select your primary goal</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="endurance">Improve Endurance</option>
            <option value="strength">Increase Strength</option>
            <option value="flexibility">Improve Flexibility</option>
            <option value="general-fitness">General Fitness</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="fitnessLevel" class="form-label">Current Fitness Level</label>
          <select id="fitnessLevel" v-model="formData.fitnessLevel" class="form-select">
            <option value="">Select your fitness level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="targetWeight" class="form-label">Target Weight (kg)</label>
            <input 
              id="targetWeight"
              v-model="formData.targetWeight"
              type="number"
              min="0"
              step="0.1"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="weeklyWorkouts" class="form-label">Workouts Per Week</label>
            <select id="weeklyWorkouts" v-model="formData.weeklyWorkouts" class="form-select">
              <option value="">Select frequency</option>
              <option value="1-2">1-2 times</option>
              <option value="3-4">3-4 times</option>
              <option value="5-6">5-6 times</option>
              <option value="7+">7+ times</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Target Areas (select all that apply)</label>
          <div class="checkbox-group">
            <div v-for="area in targetAreas" :key="area.value" class="form-checkbox">
              <input 
                :id="`area-${area.value}`"
                type="checkbox"
                :value="area.value"
                v-model="formData.targetAreas"
              />
              <label :for="`area-${area.value}`">{{ area.label }}</label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Preferences Form -->
      <div v-if="formType === 'preferences'" class="form-section">
        <div class="form-group">
          <label class="form-label">Workout Preferences (select all that apply)</label>
          <div class="checkbox-group">
            <div v-for="pref in workoutPreferences" :key="pref.value" class="form-checkbox">
              <input 
                :id="`pref-${pref.value}`"
                type="checkbox"
                :value="pref.value"
                v-model="formData.workoutPreferences"
              />
              <label :for="`pref-${pref.value}`">{{ pref.label }}</label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="workoutLocation" class="form-label">Preferred Workout Location</label>
          <select id="workoutLocation" v-model="formData.workoutLocation" class="form-select">
            <option value="">Select location</option>
            <option value="home">Home</option>
            <option value="gym">Gym</option>
            <option value="outdoors">Outdoors</option>
            <option value="mixed">Mixed/Various</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Dietary Restrictions (select all that apply)</label>
          <div class="checkbox-group">
            <div v-for="diet in dietaryRestrictions" :key="diet.value" class="form-checkbox">
              <input 
                :id="`diet-${diet.value}`"
                type="checkbox"
                :value="diet.value"
                v-model="formData.dietaryRestrictions"
              />
              <label :for="`diet-${diet.value}`">{{ diet.label }}</label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="caloricTarget" class="form-label">Daily Caloric Target</label>
          <input 
            id="caloricTarget"
            v-model="formData.caloricTarget"
            type="number"
            min="0"
            step="50"
            class="form-control"
            placeholder="e.g. 2000"
          />
          <div class="form-text">Leave blank to let the system calculate based on your goals</div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="cancelEdit" class="btn btn-outline">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading">
            <i class="fas fa-circle-notch fa-spin"></i> Saving...
          </span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ProfileForm',
  props: {
    profileData: {
      type: Object,
      default: () => ({})
    },
    formType: {
      type: String,
      default: 'personal',
      validator: value => ['personal', 'goals', 'preferences'].includes(value)
    }
  },
  data() {
    return {
      formData: {
        // Personal info
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        birthdate: '',
        height: '',
        weight: '',
        
        // Fitness goals
        primaryGoal: '',
        fitnessLevel: '',
        targetWeight: '',
        weeklyWorkouts: '',
        targetAreas: [],
        
        // Preferences
        workoutPreferences: [],
        workoutLocation: '',
        dietaryRestrictions: [],
        caloricTarget: ''
      },
      loading: false,
      
      // Options for select inputs
      targetAreas: [
        { value: 'core', label: 'Core' },
        { value: 'arms', label: 'Arms' },
        { value: 'chest', label: 'Chest' },
        { value: 'back', label: 'Back' },
        { value: 'legs', label: 'Legs' },
        { value: 'glutes', label: 'Glutes' },
        { value: 'shoulders', label: 'Shoulders' },
        { value: 'cardio', label: 'Cardiovascular' }
      ],
      workoutPreferences: [
        { value: 'strength', label: 'Strength Training' },
        { value: 'cardio', label: 'Cardio' },
        { value: 'hiit', label: 'HIIT' },
        { value: 'yoga', label: 'Yoga' },
        { value: 'pilates', label: 'Pilates' },
        { value: 'bodyweight', label: 'Bodyweight Exercises' },
        { value: 'running', label: 'Running' },
        { value: 'cycling', label: 'Cycling' },
        { value: 'swimming', label: 'Swimming' }
      ],
      dietaryRestrictions: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'gluten-free', label: 'Gluten-Free' },
        { value: 'dairy-free', label: 'Dairy-Free' },
        { value: 'keto', label: 'Keto' },
        { value: 'paleo', label: 'Paleo' },
        { value: 'low-carb', label: 'Low-Carb' },
        { value: 'low-fat', label: 'Low-Fat' },
        { value: 'nut-free', label: 'Nut-Free' },
        { value: 'halal', label: 'Halal' },
        { value: 'kosher', label: 'Kosher' }
      ]
    };
  },
  created() {
    // Initialize form data from props
    this.initFormData();
  },
  methods: {
    initFormData() {
      // Clone the profile data to avoid modifying the props directly
      // Only copy the fields relevant to the current form type
      
      if (this.formType === 'personal') {
        this.formData = {
          firstName: this.profileData.firstName || '',
          lastName: this.profileData.lastName || '',
          email: this.profileData.email || '',
          gender: this.profileData.gender || '',
          birthdate: this.profileData.birthdate || '',
          height: this.profileData.height || '',
          weight: this.profileData.weight || ''
        };
      } else if (this.formType === 'goals') {
        this.formData = {
          primaryGoal: this.profileData.primaryGoal || '',
          fitnessLevel: this.profileData.fitnessLevel || '',
          targetWeight: this.profileData.targetWeight || '',
          weeklyWorkouts: this.profileData.weeklyWorkouts || '',
          targetAreas: this.profileData.targetAreas || []
        };
      } else if (this.formType === 'preferences') {
        this.formData = {
          workoutPreferences: this.profileData.workoutPreferences || [],
          workoutLocation: this.profileData.workoutLocation || '',
          dietaryRestrictions: this.profileData.dietaryRestrictions || [],
          caloricTarget: this.profileData.caloricTarget || ''
        };
      }
    },
    
    async handleSubmit() {
      this.loading = true;
      
      try {
        // Emit the form data to the parent component
        this.$emit('save', this.formData);
      } catch (error) {
        console.error('Error saving form:', error);
      } finally {
        this.loading = false;
      }
    },
    
    cancelEdit() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.profile-form {
  margin-bottom: var(--spacing-md);
}

.form-section {
  margin-bottom: var(--spacing-lg);
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
}

.form-control, .form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
}

.form-control:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.form-text {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.form-checkbox {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.form-checkbox input {
  margin-right: var(--spacing-xs);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>
