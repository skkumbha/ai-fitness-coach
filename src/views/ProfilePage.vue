<template>
  <div class="profile-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Your Profile</h1>
        <p class="page-subtitle">
          Manage your personal information and fitness preferences
        </p>
      </div>
      
      <div class="profile-container">
        <div class="profile-sidebar">
          <div class="profile-avatar-section">
            <div class="profile-avatar" v-if="userAvatar">
              <img :src="userAvatar" alt="User profile picture" />
            </div>
            <div class="profile-avatar profile-avatar-placeholder" v-else>
              <i class="fas fa-user"></i>
            </div>
            <button class="btn btn-sm btn-outline change-avatar-btn" @click="openAvatarUpload">
              <i class="fas fa-camera"></i> Change Photo
            </button>
          </div>
          
          <div class="profile-menu">
            <button 
              v-for="(tab, index) in profileTabs" 
              :key="index"
              @click="activeTab = tab.id"
              class="profile-menu-item"
              :class="{ active: activeTab === tab.id }"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
            </button>
            
            <div class="menu-separator"></div>
            
            <button @click="logout" class="profile-menu-item text-error">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
        
        <div class="profile-content">
          <div v-if="loading" class="loading-container">
            <LoadingSpinner message="Loading profile data..." />
          </div>
          
          <div v-else-if="error" class="error-container">
            <ErrorMessage 
              :message="error" 
              title="Error Loading Profile"
              showRetry
              @retry="fetchProfileData"
            />
          </div>
          
          <div v-else>
            <!-- Personal Information -->
            <div v-if="activeTab === 'personal'" class="profile-section">
              <div class="section-header">
                <h2 class="section-title">Personal Information</h2>
                <button v-if="!editingPersonal" @click="editingPersonal = true" class="btn btn-sm btn-outline">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </div>
              
              <ProfileForm 
                v-if="editingPersonal"
                :profile-data="userData"
                form-type="personal"
                @save="savePersonalInfo"
                @cancel="editingPersonal = false"
              />
              
              <div v-else class="profile-info">
                <div class="info-row">
                  <div class="info-label">Name</div>
                  <div class="info-value">{{ userData.firstName }} {{ userData.lastName }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{ userData.email }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Gender</div>
                  <div class="info-value">{{ userData.gender || 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Birth Date</div>
                  <div class="info-value">{{ formatDate(userData.birthdate) || 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Height</div>
                  <div class="info-value">{{ userData.height ? `${userData.height} cm` : 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Weight</div>
                  <div class="info-value">{{ userData.weight ? `${userData.weight} kg` : 'Not specified' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Fitness Goals -->
            <div v-if="activeTab === 'goals'" class="profile-section">
              <div class="section-header">
                <h2 class="section-title">Fitness Goals</h2>
                <button v-if="!editingGoals" @click="editingGoals = true" class="btn btn-sm btn-outline">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </div>
              
              <ProfileForm 
                v-if="editingGoals"
                :profile-data="userData"
                form-type="goals"
                @save="saveGoalsInfo"
                @cancel="editingGoals = false"
              />
              
              <div v-else class="profile-info">
                <div class="info-row">
                  <div class="info-label">Primary Goal</div>
                  <div class="info-value">{{ userData.primaryGoal || 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Fitness Level</div>
                  <div class="info-value">{{ userData.fitnessLevel || 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Target Weight</div>
                  <div class="info-value">{{ userData.targetWeight ? `${userData.targetWeight} kg` : 'Not specified' }}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Weekly Workouts</div>
                  <div class="info-value">{{ userData.weeklyWorkouts || 'Not specified' }}</div>
                </div>
                
                <div class="goals-list" v-if="activeGoals.length > 0">
                  <h3 class="list-title">Active Goals</h3>
                  <GoalTracker 
                    v-for="goal in activeGoals" 
                    :key="goal.id"
                    :goal="goal"
                    @update="editGoal"
                    @complete="completeGoal"
                  />
                </div>
              </div>
            </div>
            
            <!-- Preferences -->
            <div v-if="activeTab === 'preferences'" class="profile-section">
              <div class="section-header">
                <h2 class="section-title">Preferences</h2>
                <button v-if="!editingPreferences" @click="editingPreferences = true" class="btn btn-sm btn-outline">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </div>
              
              <ProfileForm 
                v-if="editingPreferences"
                :profile-data="userData"
                form-type="preferences"
                @save="savePreferencesInfo"
                @cancel="editingPreferences = false"
              />
              
              <div v-else class="profile-info">
                <div class="info-section">
                  <h3 class="info-title">Workout Preferences</h3>
                  
                  <div class="info-row">
                    <div class="info-label">Workout Types</div>
                    <div class="info-value tags">
                      <span v-for="(pref, index) in userData.workoutPreferences" :key="index" class="tag">
                        {{ pref }}
                      </span>
                      <span v-if="!userData.workoutPreferences || userData.workoutPreferences.length === 0" class="empty-text">
                        No preferences set
                      </span>
                    </div>
                  </div>
                  
                  <div class="info-row">
                    <div class="info-label">Workout Location</div>
                    <div class="info-value">{{ userData.workoutLocation || 'Not specified' }}</div>
                  </div>
                </div>
                
                <div class="info-section">
                  <h3 class="info-title">Dietary Preferences</h3>
                  
                  <div class="info-row">
                    <div class="info-label">Dietary Restrictions</div>
                    <div class="info-value tags">
                      <span v-for="(restriction, index) in userData.dietaryRestrictions" :key="index" class="tag">
                        {{ restriction }}
                      </span>
                      <span v-if="!userData.dietaryRestrictions || userData.dietaryRestrictions.length === 0" class="empty-text">
                        No restrictions set
                      </span>
                    </div>
                  </div>
                  
                  <div class="info-row">
                    <div class="info-label">Caloric Target</div>
                    <div class="info-value">{{ userData.caloricTarget ? `${userData.caloricTarget} calories/day` : 'Not specified' }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Account settings -->
            <div v-if="activeTab === 'account'" class="profile-section">
              <div class="section-header">
                <h2 class="section-title">Account Settings</h2>
              </div>
              
              <div class="account-settings">
                <div class="settings-card">
                  <h3 class="settings-title">Change Password</h3>
                  <p class="settings-desc">Update your password to keep your account secure</p>
                  <button @click="showChangePasswordForm = !showChangePasswordForm" class="btn btn-outline">
                    <i class="fas fa-key"></i> Change Password
                  </button>
                </div>
                
                <form v-if="showChangePasswordForm" @submit.prevent="changePassword" class="password-form">
                  <div class="form-group">
                    <label for="currentPassword" class="form-label">Current Password</label>
                    <input 
                      id="currentPassword"
                      v-model="passwordForm.currentPassword"
                      type="password"
                      class="form-control"
                      required
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="newPassword" class="form-label">New Password</label>
                    <input 
                      id="newPassword"
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="form-control"
                      required
                    />
                  </div>
                  
                  <div class="form-group">
                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                    <input 
                      id="confirmPassword"
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="form-control"
                      required
                    />
                  </div>
                  
                  <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
                  
                  <div class="form-actions">
                    <button type="button" @click="showChangePasswordForm = false" class="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                      <span v-if="passwordLoading">
                        <i class="fas fa-circle-notch fa-spin"></i> Processing...
                      </span>
                      <span v-else>Update Password</span>
                    </button>
                  </div>
                </form>
                
                <div class="settings-card">
                  <h3 class="settings-title">Notifications</h3>
                  <p class="settings-desc">Manage your notification preferences</p>
                  
                  <div class="notification-options">
                    <div class="notification-option">
                      <div class="option-label">
                        <span class="option-title">Email Notifications</span>
                        <span class="option-desc">Receive emails about your progress and new features</span>
                      </div>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="notificationSettings.email">
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div class="notification-option">
                      <div class="option-label">
                        <span class="option-title">Workout Reminders</span>
                        <span class="option-desc">Get notifications before your scheduled workouts</span>
                      </div>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="notificationSettings.workouts">
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div class="notification-option">
                      <div class="option-label">
                        <span class="option-title">Goal Updates</span>
                        <span class="option-desc">Receive updates on your goal progress</span>
                      </div>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="notificationSettings.goals">
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <button @click="saveNotificationSettings" class="btn btn-outline mt-3">
                    <i class="fas fa-save"></i> Save Notification Settings
                  </button>
                </div>
                
                <div class="settings-card danger-zone">
                  <h3 class="settings-title">Danger Zone</h3>
                  <p class="settings-desc">Permanent actions that cannot be undone</p>
                  
                  <button @click="confirmDeleteAccount" class="btn btn-danger">
                    <i class="fas fa-trash-alt"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import ProfileForm from '@/components/ProfileForm.vue';
import GoalTracker from '@/components/GoalTracker.vue';

export default {
  name: 'ProfilePage',
  components: {
    LoadingSpinner,
    ErrorMessage,
    ProfileForm,
    GoalTracker
  },
  data() {
    return {
      loading: true,
      error: null,
      activeTab: 'personal',
      userData: {},
      
      editingPersonal: false,
      editingGoals: false,
      editingPreferences: false,
      
      showChangePasswordForm: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      passwordLoading: false,
      
      notificationSettings: {
        email: true,
        workouts: true,
        goals: true
      },
      
      activeGoals: [],
      
      profileTabs: [
        { id: 'personal', label: 'Personal Information', icon: 'fas fa-user' },
        { id: 'goals', label: 'Fitness Goals', icon: 'fas fa-bullseye' },
        { id: 'preferences', label: 'Preferences', icon: 'fas fa-sliders-h' },
        { id: 'account', label: 'Account Settings', icon: 'fas fa-cog' }
      ]
    };
  },
  computed: {
    userAvatar() {
      return this.userData?.avatar || null;
    }
  },
  async mounted() {
    await this.fetchProfileData();
    this.fetchGoals();
  },
  methods: {
    async fetchProfileData() {
      this.loading = true;
      this.error = null;
      
      try {
        await this.$store.dispatch('fetchUserProfile');
        this.userData = { ...this.$store.getters.currentUser };
      } catch (error) {
        this.error = error.message || 'Failed to load profile data. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    fetchGoals() {
      // This would normally fetch from the API
      // For demo purposes, using mock data
      this.activeGoals = [
        {
          id: '1',
          title: 'Weight Loss Goal',
          description: 'Lose weight through consistent exercise and nutrition',
          startDate: '2023-06-01',
          endDate: '2023-09-01',
          startValue: 185,
          currentValue: 175,
          targetValue: 170,
          unit: 'lbs',
          isReduceGoal: true,
          metrics: [
            { label: 'Starting', value: '185 lbs' },
            { label: 'Current', value: '175 lbs' },
            { label: 'Target', value: '170 lbs' }
          ]
        },
        {
          id: '2',
          title: 'Strength Training',
          description: 'Increase bench press max weight',
          startDate: '2023-06-01',
          endDate: '2023-09-01',
          startValue: 135,
          currentValue: 155,
          targetValue: 180,
          unit: 'lbs',
          metrics: [
            { label: 'Starting', value: '135 lbs' },
            { label: 'Current', value: '155 lbs' },
            { label: 'Target', value: '180 lbs' }
          ]
        }
      ];
    },
    
    openAvatarUpload() {
      // Would open file upload dialog or modal
      alert('Upload avatar functionality would open here');
    },
    
    async savePersonalInfo(data) {
      try {
        // Update the userData object
        this.userData = { ...this.userData, ...data };
        
        // In a real app, would call API to update profile
        await this.$store.dispatch('updateUserProfile', this.userData);
        
        // Exit edit mode
        this.editingPersonal = false;
      } catch (error) {
        alert('Failed to save personal information: ' + (error.message || 'Unknown error'));
      }
    },
    
    async saveGoalsInfo(data) {
      try {
        // Update the userData object
        this.userData = { ...this.userData, ...data };
        
        // In a real app, would call API to update profile
        await this.$store.dispatch('updateUserProfile', this.userData);
        
        // Exit edit mode
        this.editingGoals = false;
      } catch (error) {
        alert('Failed to save goals information: ' + (error.message || 'Unknown error'));
      }
    },
    
    async savePreferencesInfo(data) {
      try {
        // Update the userData object
        this.userData = { ...this.userData, ...data };
        
        // In a real app, would call API to update profile
        await this.$store.dispatch('updateUserProfile', this.userData);
        
        // Exit edit mode
        this.editingPreferences = false;
      } catch (error) {
        alert('Failed to save preferences: ' + (error.message || 'Unknown error'));
      }
    },
    
    editGoal(goalId) {
      // Would open goal editing modal
      alert(`Edit goal ${goalId}`);
    },
    
    completeGoal(goalId) {
      // Mark goal as completed
      this.activeGoals = this.activeGoals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, completed: true, completedAt: new Date().toISOString() };
        }
        return goal;
      });
    },
    
    async changePassword() {
      // Validate passwords
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'New passwords do not match';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 8) {
        this.passwordError = 'Password must be at least 8 characters long';
        return;
      }
      
      this.passwordLoading = true;
      this.passwordError = '';
      
      try {
        // In a real app, would call API to change password
        // await apiCall to change password
        
        // For demo, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset form and hide it
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.showChangePasswordForm = false;
        
        // Show success message
        alert('Password changed successfully');
      } catch (error) {
        this.passwordError = error.message || 'Failed to change password';
      } finally {
        this.passwordLoading = false;
      }
    },
    
    saveNotificationSettings() {
      // In a real app, would call API to save notification settings
      alert('Notification settings saved');
    },
    
    confirmDeleteAccount() {
      const confirmed = confirm(
        'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
      );
      
      if (confirmed) {
        this.deleteAccount();
      }
    },
    
    async deleteAccount() {
      try {
        // In a real app, would call API to delete account
        // await apiCall to delete account
        
        // For demo, log out user
        await this.$store.dispatch('logoutUser');
        
        // Redirect to homepage
        this.$router.push('/');
      } catch (error) {
        alert('Failed to delete account: ' + (error.message || 'Unknown error'));
      }
    },
    
    async logout() {
      try {
        await this.$store.dispatch('logoutUser');
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect to login even if there's an error
        this.$router.push('/login');
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.profile-page {
  padding: var(--spacing-md) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 0;
}

.profile-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--spacing-lg);
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
  border: 3px solid var(--primary-light);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-light);
  color: white;
  font-size: 3rem;
}

.change-avatar-btn {
  width: 100%;
}

.profile-menu {
  display: flex;
  flex-direction: column;
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.profile-menu-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: none;
  border: none;
  text-align: left;
  color: var(--text-color);
  transition: all var(--transition-fast);
  cursor: pointer;
  border-left: 3px solid transparent;
}

.profile-menu-item i {
  width: 20px;
  margin-right: var(--spacing-md);
}

.profile-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.profile-menu-item.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

.profile-menu-item.text-error {
  color: var(--error-color);
}

.menu-separator {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
}

.profile-content {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.loading-container,
.error-container {
  padding: var(--spacing-xl);
}

.profile-section {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.profile-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.info-value {
  font-weight: 500;
}

.info-section {
  margin-bottom: var(--spacing-md);
}

.info-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.empty-text {
  color: var(--text-tertiary);
  font-style: italic;
}

.goals-list {
  margin-top: var(--spacing-md);
}

.list-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.account-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-card {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.settings-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.settings-desc {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.password-form {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--border-radius-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.error-message {
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.notification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.notification-option:last-child {
  border-bottom: none;
}

.option-label {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.option-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.danger-zone {
  border-color: var(--error-color);
  background-color: rgba(244, 67, 54, 0.05);
}

.btn-danger {
  background-color: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.mt-3 {
  margin-top: var(--spacing-md);
}

@media (max-width: 991px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    margin-bottom: var(--spacing-lg);
  }
  
  .profile-avatar-section {
    flex-direction: row;
    align-items: center;
  }
  
  .profile-avatar {
    margin-right: var(--spacing-md);
    margin-bottom: 0;
  }
  
  .change-avatar-btn {
    width: auto;
  }
}

@media (max-width: 768px) {
  .profile-avatar-section {
    flex-direction: column;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }
  
  .change-avatar-btn {
    width: 100%;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .notification-option {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toggle-switch {
    margin-top: var(--spacing-sm);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}
</style>
