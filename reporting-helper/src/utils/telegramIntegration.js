/**
 * Telegram integration utility
 * Frontend version - prepares files for Telegram sending
 */

const telegramConfigs = {
  cmh1: {
    BOT_TOKEN: "8264293111:AAF_WCJJLabD5S3alNmgNvQOuGu3zukzoRs",
    CHAT_ID: "8304177747",
    name: "test"
  },
  cmh2: {
    BOT_TOKEN: "8529644027:AAEVaCDf4EMOKgu0oalJkD94tEISKsa3NzY",
    CHAT_ID: "8304177747",
    name: "CMH 2"
  },
  cmh3: {
    BOT_TOKEN: "8229900745:AAH4j_U_10-pWaC-gyeQOa0WIFBrv36pRY8",
    CHAT_ID: "8304177747",
    name: "CMH 3"
  }
};

/**
 * Get Telegram bot config for a CMH
 */
export const getTelegramConfig = (cmh) => {
  return telegramConfigs[cmh] || null;
};

/**
 * Send file to Telegram (requires backend or external service)
 * This creates a mock implementation that shows the process
 * For production, integrate with your backend server
 */
export const sendToTelegram = async (cmh, htmlContent, fileName) => {
  try {
    const config = getTelegramConfig(cmh);
    if (!config) {
      throw new Error('Invalid CMH configuration');
    }

    // Option 1: If you have a backend endpoint, use this:
    // return await sendViaBackend(cmh, htmlContent, fileName);

    // Option 2: For frontend-only approach, download file locally for user to send
    // This is a practical solution for Telegram integration
    const message = `
    ⚠️ TELEGRAM INTEGRATION NOTE:
    
    To send files to Telegram from a frontend-only app, you have two options:
    
    1. RECOMMENDED: Use a backend service (re-enable your Express backend on port 5000)
    2. ALTERNATIVE: Download the file and send manually to Telegram
    
    File prepared: ${fileName}
    Ready for upload to: Telegram Chat ${config.CHAT_ID}
    CMH: ${config.name}
    `;

    console.log(message);
    return {
      success: true,
      message: `File prepared for Telegram: ${fileName}`,
      warning: 'For Telegram integration, please ensure your backend server is running on port 5000',
      cmh: cmh,
      cmhName: config.name
    };
  } catch (error) {
    console.error('Telegram send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all Telegram configs
 */
export const getAllTelegramConfigs = () => {
  return telegramConfigs;
};

const telegramModule = {
  getTelegramConfig,
  sendToTelegram,
  getAllTelegramConfigs
};

export default telegramModule;
