/**
 * Telegram integration utility
 * Frontend version - prepares files for Telegram sending
 */

import { cmhConfigs } from './htmlGenerator';

/**
 * Get Telegram bot config for a CMH
 */
export const getTelegramConfig = (cmh) => {
  return cmhConfigs[cmh] || null;
};

/**
 * Send combined HTML file to Telegram
 * Creates FormData with HTML blob and sends via Telegram Bot API
 */
export const sendToTelegram = async (cmh, combinedHTML, cmhFiles) => {
  try {
    const config = getTelegramConfig(cmh);
    if (!config) {
      throw new Error('Invalid CMH configuration');
    }

    const { BOT_TOKEN, CHAT_ID, name } = config;
    const today = new Date().toISOString().split('T')[0];
    const combinedFileName = `${today}_${cmh}_COMBINED.html`;

    // Create FormData for Telegram API
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    
    // Create blob from HTML content
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    formData.append('document', blob, combinedFileName);
    
    formData.append('caption', `📊 ${name} - Combined Reports\nAll consumption reports in one file - Generated on ${new Date().toLocaleDateString()}`);

    // Send to Telegram using fetch
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();

    if (response.ok && result.ok) {
      return {
        success: true,
        message: `Combined file sent successfully for ${name}`,
        cmh: cmh,
        cmhName: name
      };
    } else {
      throw new Error(result.description || 'Unknown error from Telegram API');
    }
  } catch (error) {
    console.error('Telegram send error:', error);
    return {
      success: false,
      error: error.message,
      cmh: cmh
    };
  }
};

/**
 * Get all Telegram configs
 */
export const getAllTelegramConfigs = () => {
  return cmhConfigs;
};

const telegramModule = {
  getTelegramConfig,
  sendToTelegram,
  getAllTelegramConfigs
};

export default telegramModule;
