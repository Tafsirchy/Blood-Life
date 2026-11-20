/**
 * Telegram & Regional Webhook Emergency Dispatcher
 * Free broadcast for regional community volunteer groups.
 */

export async function broadcastTelegramEmergencyAlert({
  bloodGroup,
  units,
  hospital,
  district,
  patientName,
  requestId,
}: {
  bloodGroup: string;
  units: number;
  hospital: string;
  district: string;
  patientName: string;
  requestId: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const text = `🚨 *BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) — জরুরী রক্তের আবেদন* 🚨\n\n` +
    `🩸 *রক্তের গ্রুপ:* ${bloodGroup} (${units} ব্যাগ)\n` +
    `👤 *রোগী:* ${patientName}\n` +
    `🏥 *হাসপাতাল:* ${hospital}\n` +
    `📍 *জেলা:* ${district}\n` +
    `⏱️ *অবস্থা:* অতি-জরুরী\n\n` +
    `👉 *রক্ত দিতে বা বিস্তারিত দেখতে ক্লিক করুন:*\n` +
    `https://bloodandlife.org/requests/${requestId}\n\n` +
    `_সম্পূর্ণ ফ্রি ও দালালমুক্ত জনকল্যাণমূলক উদ্যোগ_`;

  if (!botToken || !chatId) {
    console.info(`[Telegram Broadcast Mock] ${district} | Group: ${bloodGroup} | ${hospital}`);
    return { success: true, mocked: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (error: any) {
    console.error("Telegram broadcast error:", error);
    return { success: false, error: error?.message };
  }
}
