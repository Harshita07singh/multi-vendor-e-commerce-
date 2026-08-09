const API_URL = 'https://app.text.lk/api/http/sms/send';

/**
 * Send SMS via Text.lk
 *
 * @param {Object} options
 * @param {string} options.phoneNumber - Recipient phone number (e.g., 94710000000)
 * @param {string} options.message - Message content
 * @param {string} [options.apiToken] - Text.lk API token (fallback to TEXTLK_API_TOKEN env)
 * @param {string} [options.senderId] - Sender ID (fallback to TEXTLK_SENDER_ID env)
 */
export async function sendSMS({ phoneNumber, message, apiToken, senderId }) {
  const token = apiToken || process.env.TEXTLK_API_TOKEN;
  const sender = senderId || process.env.TEXTLK_SENDER_ID;

  if (!token) {
    throw new Error(
      'Text.lk API token is missing. Provide TEXTLK_API_TOKEN in env or apiToken in function.'
    );
  }
  if (!sender) {
    throw new Error(
      'Text.lk Sender ID is missing. Provide TEXTLK_SENDER_ID in env or senderId in function.'
    );
  }

  const url = new URL(API_URL);
  url.searchParams.append('recipient', phoneNumber);
  url.searchParams.append('sender_id', sender);
  url.searchParams.append('message', message);
  url.searchParams.append('api_token', token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Text.lk API error: ${response.status} - ${errText}`);
  }

  return await response.json();
}
