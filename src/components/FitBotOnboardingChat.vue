<template>
  <div class="fitbot-chat">
    <header class="fitbot-header">
      <div class="fitbot-avatar" aria-hidden="true">🤖</div>
      <div>
        <h2 class="fitbot-title">{{ botName }}</h2>
        <p class="fitbot-subtitle">Your slightly unhinged fitness coach</p>
      </div>
    </header>

    <div ref="messageList" class="fitbot-messages">
      <div
        v-for="(msg, index) in visibleMessages"
        :key="index"
        class="fitbot-message-row"
        :class="msg.role"
      >
        <div v-if="msg.role === 'bot'" class="msg-avatar">🤖</div>
        <div class="msg-bubble" :class="msg.role">{{ msg.text }}</div>
      </div>

      <div v-if="isTyping" class="fitbot-message-row bot">
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble bot typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <div v-if="showInput && !loading" class="fitbot-input-area">
      <!-- Text -->
      <form v-if="currentStep?.inputType === 'text'" @submit.prevent="submitText">
        <input
          v-model="draftText"
          type="text"
          class="fitbot-input"
          :placeholder="currentStep.placeholder"
          autofocus
        />
        <button type="submit" class="btn btn-primary fitbot-send" :disabled="!canSubmit">Send</button>
      </form>

      <!-- Date -->
      <form v-else-if="currentStep?.inputType === 'date'" @submit.prevent="submitText">
        <input v-model="draftText" type="date" class="fitbot-input" required />
        <button type="submit" class="btn btn-primary fitbot-send" :disabled="!canSubmit">Send</button>
      </form>

      <!-- Number -->
      <form v-else-if="currentStep?.inputType === 'number'" @submit.prevent="submitNumber">
        <input
          v-model="draftText"
          type="number"
          class="fitbot-input"
          :placeholder="currentStep.placeholder"
          :step="currentStep.step || '1'"
          :min="currentStep.min ?? undefined"
        />
        <button type="submit" class="btn btn-primary fitbot-send" :disabled="!canSubmit">Send</button>
        <button
          v-if="currentStep.allowSkip"
          type="button"
          class="btn btn-outline fitbot-skip"
          @click="skipStep"
        >
          Skip
        </button>
      </form>

      <!-- Height -->
      <div v-else-if="currentStep?.inputType === 'height'" class="height-panel">
        <div class="unit-toggle">
          <button
            type="button"
            class="unit-btn"
            :class="{ active: heightUnit === 'cm' }"
            @click="heightUnit = 'cm'"
          >
            cm
          </button>
          <button
            type="button"
            class="unit-btn"
            :class="{ active: heightUnit === 'ft' }"
            @click="heightUnit = 'ft'"
          >
            ft / in
          </button>
        </div>
        <div v-if="heightUnit === 'cm'" class="height-row">
          <input v-model="heightCm" type="number" class="fitbot-input" placeholder="Height in cm" min="1" />
        </div>
        <div v-else class="height-row">
          <input v-model="heightFeet" type="number" class="fitbot-input" placeholder="Feet" min="0" max="8" />
          <input v-model="heightInches" type="number" class="fitbot-input" placeholder="Inches" min="0" max="11" />
        </div>
        <button type="button" class="btn btn-primary fitbot-send" :disabled="!canSubmitHeight" @click="submitHeight">
          Send
        </button>
      </div>

      <!-- Single choice chips -->
      <div v-else-if="currentStep?.inputType === 'choice'" class="choice-grid">
        <button
          v-for="opt in currentStep.options"
          :key="opt.value"
          type="button"
          class="choice-chip"
          @click="submitChoice(opt)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Select dropdown -->
      <form v-else-if="currentStep?.inputType === 'select'" @submit.prevent="submitSelect">
        <select v-model="draftText" class="fitbot-input fitbot-select" required>
          <option value="" disabled>Select timezone</option>
          <option v-for="opt in currentStep.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button type="submit" class="btn btn-primary fitbot-send" :disabled="!draftText">Send</button>
      </form>

      <!-- Multi select -->
      <div v-else-if="currentStep?.inputType === 'multi'" class="multi-panel">
        <div class="choice-grid multi">
          <button
            v-for="opt in currentStep.options"
            :key="opt.value"
            type="button"
            class="choice-chip"
            :class="{ selected: draftMulti.includes(opt.value) }"
            @click="toggleMulti(opt.value)"
          >
            <span v-if="opt.emoji">{{ opt.emoji }} </span>{{ opt.label }}
          </button>
        </div>
        <div class="multi-actions">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canSubmitMulti"
            @click="submitMulti"
          >
            Continue
          </button>
          <button
            v-if="currentStep.allowSkip"
            type="button"
            class="btn btn-outline"
            @click="skipStep"
          >
            Skip
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="fitbot-loading">
      <i class="fas fa-circle-notch fa-spin"></i> FitBot is filing your paperwork with the gains department…
    </div>
  </div>
</template>

<script>
import { feetInchesToCm } from '@/utils/heightUtils';
import {
  FITBOT_NAME,
  buildOnboardingSteps,
  createInitialFormData
} from '@/config/fitbotOnboardingScript';

export default {
  name: 'FitBotOnboardingChat',
  props: {
    formData: {
      type: Object,
      default: () => createInitialFormData()
    },
    loading: {
      type: Boolean,
      default: false
    },
    firstName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:formData', 'complete'],
  data() {
    return {
      botName: FITBOT_NAME,
      steps: buildOnboardingSteps(),
      stepIndex: 0,
      messages: [],
      isTyping: false,
      showInput: false,
      draftText: '',
      draftMulti: [],
      heightUnit: 'cm',
      heightCm: '',
      heightFeet: '',
      heightInches: '',
      heightFeetDisplay: '',
      heightInchesDisplay: ''
    };
  },
  computed: {
    visibleMessages() {
      return this.messages;
    },
    currentStep() {
      return this.steps[this.stepIndex] || null;
    },
    context() {
      return {
        preferredName: this.formData.preferredName,
        firstName: this.firstName,
        primaryGoal: this.formData.primaryGoal,
        weight: this.formData.weight
      };
    },
    canSubmit() {
      if (!this.currentStep) return false;
      return this.currentStep.validate(this.draftText, this.formData);
    },
    canSubmitHeight() {
      if (this.heightUnit === 'cm') {
        return this.heightCm && Number(this.heightCm) > 0;
      }
      return (
        this.heightFeet !== '' &&
        Number(this.heightFeet) >= 0 &&
        this.heightInches !== '' &&
        Number(this.heightInches) >= 0
      );
    },
    canSubmitMulti() {
      if (this.currentStep?.allowSkip) return true;
      return this.draftMulti.length > 0;
    }
  },
  mounted() {
    this.runStep();
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },

    pushBot(text) {
      this.messages.push({ role: 'bot', text });
      this.scrollToBottom();
    },

    pushUser(text) {
      this.messages.push({ role: 'user', text });
      this.scrollToBottom();
    },

    async runStep() {
      const step = this.currentStep;
      if (!step) {
        this.$emit('complete');
        return;
      }

      this.showInput = false;
      this.draftText = '';
      this.draftMulti = [];

      const lines = step.messages(this.context);
      for (let i = 0; i < lines.length; i++) {
        this.isTyping = true;
        await this.delay(step.delayMs ?? 600);
        this.isTyping = false;
        this.pushBot(lines[i]);
      }

      if (step.autoAdvance) {
        await this.delay(step.delayMs ?? 500);
        this.stepIndex += 1;
        this.runStep();
        return;
      }

      if (step.field === 'timezone') {
        this.draftText = this.formData.timezone || '';
      }

      this.showInput = true;
      this.scrollToBottom();
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    updateForm(patch) {
      const next = { ...this.formData, ...patch };
      this.$emit('update:formData', next);
      return next;
    },

    async afterAnswer(userLabel, extraBotLine) {
      this.pushUser(userLabel);
      this.showInput = false;
      if (extraBotLine) {
        this.isTyping = true;
        await this.delay(500);
        this.isTyping = false;
        this.pushBot(extraBotLine);
        await this.delay(400);
      }
      this.stepIndex += 1;
      this.runStep();
    },

    submitText() {
      if (!this.canSubmit) return;
      const value = this.draftText.trim();
      this.updateForm({ [this.currentStep.field]: value });
      const label = this.currentStep.formatAnswer
        ? this.currentStep.formatAnswer(value, this.formData)
        : value;
      this.afterAnswer(label, null);
    },

    submitNumber() {
      const value = this.draftText;
      if (!this.currentStep.allowSkip && !this.canSubmit) return;
      const next = this.updateForm({ [this.currentStep.field]: value || '' });
      const label = this.currentStep.formatAnswer
        ? this.currentStep.formatAnswer(value, next)
        : value || 'Skipped';
      const extra = this.currentStep.onAnswer?.(value, null, next) || null;
      this.afterAnswer(label, extra);
    },

    skipStep() {
      this.updateForm({ [this.currentStep.field]: this.currentStep.inputType === 'multi' ? [] : '' });
      this.afterAnswer('Skipped — no worries', null);
    },

    submitHeight() {
      if (!this.canSubmitHeight) return;
      let cm;
      if (this.heightUnit === 'cm') {
        cm = String(Math.round(Number(this.heightCm)));
        this.heightFeetDisplay = '';
        this.heightInchesDisplay = '';
      } else {
        cm = String(feetInchesToCm(this.heightFeet, this.heightInches));
        this.heightFeetDisplay = String(this.heightFeet);
        this.heightInchesDisplay = String(this.heightInches);
      }
      const form = this.updateForm({
        height: cm,
        heightUnit: this.heightUnit,
        heightFeetDisplay: this.heightFeetDisplay,
        heightInchesDisplay: this.heightInchesDisplay
      });
      const label = this.currentStep.formatAnswer(cm, form);
      this.afterAnswer(label, null);
    },

    submitChoice(opt) {
      const next = this.updateForm({ [this.currentStep.field]: opt.value });
      const extra = this.currentStep.onAnswer?.(opt.value, opt, next);
      this.afterAnswer(opt.label, extra);
    },

    submitSelect() {
      if (!this.draftText) return;
      this.updateForm({ [this.currentStep.field]: this.draftText });
      const opt = this.currentStep.options.find((o) => o.value === this.draftText);
      this.afterAnswer(opt?.label || this.draftText, null);
    },

    toggleMulti(value) {
      const set = new Set(this.draftMulti);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      this.draftMulti = [...set];
    },

    submitMulti() {
      if (!this.canSubmitMulti) return;
      const values = [...this.draftMulti];
      this.updateForm({ [this.currentStep.field]: values });
      const labels = this.currentStep.options
        .filter((o) => values.includes(o.value))
        .map((o) => o.label)
        .join(', ');
      this.afterAnswer(labels || 'None selected', null);
    }
  }
};
</script>

<style scoped>
.fitbot-chat {
  display: flex;
  flex-direction: column;
  height: min(78vh, 720px);
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.fitbot-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(33, 150, 243, 0.08));
}

.fitbot-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  box-shadow: var(--shadow-sm);
}

.fitbot-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.fitbot-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.fitbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.fitbot-message-row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-xs);
  max-width: 92%;
}

.fitbot-message-row.bot {
  align-self: flex-start;
}

.fitbot-message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.msg-bubble {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 18px;
  line-height: 1.45;
  font-size: var(--font-size-md);
}

.msg-bubble.bot {
  background: rgba(76, 175, 80, 0.12);
  color: var(--text-color);
  border-bottom-left-radius: 4px;
}

.msg-bubble.user {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.msg-bubble.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.msg-bubble.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.5;
  animation: bounce 1.2s infinite;
}

.msg-bubble.typing span:nth-child(2) { animation-delay: 0.15s; }
.msg-bubble.typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.fitbot-input-area {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}

.fitbot-input-area form,
.height-panel,
.multi-panel {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.fitbot-input {
  flex: 1;
  min-width: 160px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
}

.fitbot-select {
  min-width: 100%;
}

.fitbot-send,
.fitbot-skip {
  white-space: nowrap;
}

.choice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  width: 100%;
}

.choice-grid.multi {
  margin-bottom: var(--spacing-sm);
}

.choice-chip {
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 999px;
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.15s ease;
}

.choice-chip:hover {
  border-color: var(--primary-color);
  background: rgba(76, 175, 80, 0.08);
}

.choice-chip.selected {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.unit-toggle {
  display: flex;
  gap: 4px;
  width: 100%;
}

.unit-btn {
  flex: 1;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.unit-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.height-row {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
}

.multi-actions {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
}

.fitbot-loading {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 576px) {
  .fitbot-chat {
    height: calc(100vh - 120px);
    border-radius: 0;
  }

  .choice-chip {
    width: 100%;
    text-align: center;
  }
}
</style>
