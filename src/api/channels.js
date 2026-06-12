import API from './index';

/**
 * List active channel links for the current user.
 * @returns {Promise<Array<{ channelName, botName, status, externalUserIdMasked }>>}
 */
export const listChannels = async () => {
  const response = await API.get('/channels');
  return response.data;
};

/**
 * Start Telegram linking — returns a deep link the user opens in Telegram.
 * @returns {Promise<{ channelName, deepLink, linkToken, expiresAt }>}
 */
export const startTelegramLink = async () => {
  const response = await API.post('/channels/telegram/link');
  return response.data;
};

/**
 * Disable the Telegram channel link for the current user.
 */
export const disableTelegram = async () => {
  const response = await API.delete('/channels/telegram');
  return response.data;
};
