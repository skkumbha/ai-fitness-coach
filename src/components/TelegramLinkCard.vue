<template>
  <div class="settings-card telegram-card">
    <div class="telegram-header">
      <div class="telegram-icon" aria-hidden="true">
        <i class="fab fa-telegram-plane"></i>
      </div>
      <div>
        <h3 class="settings-title">Telegram</h3>
        <p class="settings-desc">
          Chat with your coach on Telegram — get workout reminders and log sessions from your phone.
        </p>
      </div>
    </div>

    <div v-if="channelsLoading" class="telegram-status">
      <LoadingSpinner message="Loading connection status..." />
    </div>

    <div v-else-if="channelsError" class="telegram-error">
      <ErrorMessage
        :message="channelsError"
        title="Could not load Telegram status"
        show-retry
        @retry="loadChannels"
      />
    </div>

    <template v-else>
      <!-- Connected -->
      <div v-if="isLinked" class="telegram-connected">
        <div class="status-badge status-badge--connected">
          <i class="fas fa-check-circle"></i> Connected
        </div>
        <p v-if="telegramLink.botName" class="telegram-meta">
          Bot: <strong>{{ telegramLink.botName }}</strong>
          <span v-if="telegramLink.externalUserIdMasked">
            · ID {{ telegramLink.externalUserIdMasked }}
          </span>
        </p>
        <button
          type="button"
          class="btn btn-outline"
          :disabled="disconnecting"
          @click="disconnectTelegram"
        >
          <span v-if="disconnecting"><i class="fas fa-circle-notch fa-spin"></i> Disconnecting...</span>
          <span v-else><i class="fas fa-unlink"></i> Disconnect Telegram</span>
        </button>
      </div>

      <!-- Pending invite -->
      <div v-else-if="pendingInvite" class="telegram-pending">
        <div class="status-badge status-badge--pending">
          <i class="fas fa-clock"></i> Waiting for Telegram
        </div>
        <p class="telegram-instructions">
          Open Telegram and tap <strong>Start</strong> on the bot. This link expires
          {{ formatExpiry(pendingInvite.expiresAt) }}.
        </p>
        <div class="telegram-actions">
          <a
            :href="pendingInvite.deepLink"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            <i class="fab fa-telegram-plane"></i> Open in Telegram
          </a>
          <button type="button" class="btn btn-outline" :disabled="linking" @click="startLink">
            <i class="fas fa-redo"></i> New link
          </button>
          <button type="button" class="btn btn-outline" @click="cancelPending">
            Cancel
          </button>
        </div>
        <p class="telegram-hint">
          <i class="fas fa-sync-alt fa-spin" v-if="polling"></i>
          Checking connection{{ polling ? '…' : '' }}
        </p>
      </div>

      <!-- Not linked -->
      <div v-else class="telegram-disconnected">
        <div class="status-badge status-badge--disconnected">
          <i class="fas fa-plug"></i> Not connected
        </div>
        <p v-if="linkError" class="link-error">{{ linkError }}</p>
        <button type="button" class="btn btn-primary" :disabled="linking" @click="startLink">
          <span v-if="linking"><i class="fas fa-circle-notch fa-spin"></i> Generating link...</span>
          <span v-else><i class="fab fa-telegram-plane"></i> Connect Telegram</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { listChannels, startTelegramLink, disableTelegram } from '@/api/channels';

const TELEGRAM_CHANNEL = 'telegram';
const POLL_INTERVAL_MS = 3000;

export default {
  name: 'TelegramLinkCard',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      channelsLoading: true,
      channelsError: null,
      channels: [],
      pendingInvite: null,
      linking: false,
      disconnecting: false,
      linkError: null,
      polling: false,
      pollTimer: null
    };
  },
  computed: {
    telegramLink() {
      return this.channels.find(
        (c) => c.channelName?.toLowerCase() === TELEGRAM_CHANNEL
      );
    },
    isLinked() {
      return Boolean(this.telegramLink);
    }
  },
  mounted() {
    this.loadChannels();
    this.restorePendingFromSession();
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    async loadChannels() {
      this.channelsLoading = true;
      this.channelsError = null;
      try {
        this.channels = await listChannels();
        if (this.isLinked) {
          this.clearPendingSession();
          this.pendingInvite = null;
          this.stopPolling();
        }
      } catch (error) {
        this.channelsError = error.message || 'Failed to load channel links.';
      } finally {
        this.channelsLoading = false;
      }
    },

    async startLink() {
      this.linking = true;
      this.linkError = null;
      try {
        const response = await startTelegramLink();
        this.pendingInvite = response;
        this.savePendingToSession(response);
        this.startPolling();
        window.open(response.deepLink, '_blank', 'noopener,noreferrer');
      } catch (error) {
        const status = error.response?.status;
        if (status === 400) {
          this.linkError = 'Telegram is already linked to this account.';
          await this.loadChannels();
        } else {
          this.linkError = error.message || 'Could not start Telegram linking.';
        }
      } finally {
        this.linking = false;
      }
    },

    async disconnectTelegram() {
      const confirmed = confirm(
        'Disconnect Telegram? You will stop receiving coach messages on Telegram until you connect again.'
      );
      if (!confirmed) return;

      this.disconnecting = true;
      try {
        await disableTelegram();
        this.channels = [];
        this.pendingInvite = null;
        this.clearPendingSession();
        this.stopPolling();
      } catch (error) {
        alert(error.message || 'Failed to disconnect Telegram.');
      } finally {
        this.disconnecting = false;
      }
    },

    cancelPending() {
      this.pendingInvite = null;
      this.clearPendingSession();
      this.stopPolling();
    },

    startPolling() {
      this.stopPolling();
      this.polling = true;
      this.pollTimer = setInterval(async () => {
        if (!this.pendingInvite) {
          this.stopPolling();
          return;
        }
        if (this.isInviteExpired(this.pendingInvite.expiresAt)) {
          this.linkError = 'Link expired. Generate a new link to connect.';
          this.cancelPending();
          return;
        }
        try {
          this.channels = await listChannels();
          if (this.isLinked) {
            this.pendingInvite = null;
            this.clearPendingSession();
            this.stopPolling();
          }
        } catch {
          // Keep polling; transient errors are ok
        }
      }, POLL_INTERVAL_MS);
    },

    stopPolling() {
      this.polling = false;
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    isInviteExpired(expiresAt) {
      if (!expiresAt) return false;
      return new Date(expiresAt) <= new Date();
    },

    formatExpiry(expiresAt) {
      if (!expiresAt) return 'soon';
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime())) return 'soon';
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    },

    pendingSessionKey() {
      return 'telegramLinkPending';
    },

    savePendingToSession(invite) {
      try {
        sessionStorage.setItem(this.pendingSessionKey(), JSON.stringify(invite));
      } catch {
        // ignore quota errors
      }
    },

    restorePendingFromSession() {
      try {
        const raw = sessionStorage.getItem(this.pendingSessionKey());
        if (!raw) return;
        const invite = JSON.parse(raw);
        if (this.isInviteExpired(invite.expiresAt)) {
          this.clearPendingSession();
          return;
        }
        this.pendingInvite = invite;
        this.startPolling();
      } catch {
        this.clearPendingSession();
      }
    },

    clearPendingSession() {
      sessionStorage.removeItem(this.pendingSessionKey());
    }
  }
};
</script>

<style scoped>
.telegram-card {
  margin-top: 0;
}

.telegram-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.telegram-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2aabee, #229ed9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.telegram-status {
  padding: var(--spacing-md) 0;
}

.telegram-error {
  margin-bottom: var(--spacing-sm);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.status-badge--connected {
  background: rgba(76, 175, 80, 0.15);
  color: var(--primary-color);
}

.status-badge--pending {
  background: rgba(255, 193, 7, 0.15);
  color: #f57c00;
}

.status-badge--disconnected {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-secondary);
}

.telegram-meta {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.telegram-instructions {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.telegram-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.telegram-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
}

.link-error {
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 768px) {
  .telegram-actions {
    flex-direction: column;
  }

  .telegram-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
