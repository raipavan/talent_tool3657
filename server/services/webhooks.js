import crypto from 'node:crypto';

export async function dispatchWebhookEvent(store, eventName, payload) {
  try {
    const webhooks = await store.listWebhooks();
    const active = webhooks.filter((w) => w.isActive && (w.events.includes(eventName) || w.events.includes('*')));

    if (active.length === 0) return;

    const bodyString = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      payload,
    });

    // Fire in parallel without blocking main turn
    Promise.allSettled(
      active.map(async (hook) => {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TalentPool365-Webhooks/1.0',
          };

          if (hook.secret) {
            const signature = crypto.createHmac('sha256', hook.secret).update(bodyString).digest('hex');
            headers['X-TP365-Signature'] = `sha256=${signature}`;
          }

          const res = await fetch(hook.url, {
            method: 'POST',
            headers,
            body: bodyString,
            signal: AbortSignal.timeout(5000),
          });

          await store.recordWebhookResult(hook.id, res.status);
        } catch (err) {
          await store.recordWebhookResult(hook.id, 504);
        }
      }),
    ).catch(() => {});
  } catch (err) {
    console.warn('[Webhook Dispatch Error]', err.message);
  }
}

export async function sendWebhookTestPing(store, hook, triggeredBy) {
  const bodyString = JSON.stringify({
    event: 'test.ping',
    timestamp: new Date().toISOString(),
    payload: {
      message: 'Hello from TalentPool365 Webhooks!',
      triggeredBy,
      webhookId: hook.id,
    },
  });

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'TalentPool365-Webhooks/1.0',
  };

  if (hook.secret) {
    const signature = crypto.createHmac('sha256', hook.secret).update(bodyString).digest('hex');
    headers['X-TP365-Signature'] = `sha256=${signature}`;
  }

  try {
    const res = await fetch(hook.url, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: AbortSignal.timeout(5000),
    });
    await store.recordWebhookResult(hook.id, res.status);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    await store.recordWebhookResult(hook.id, 504);
    return { ok: false, status: 504, error: err.message };
  }
}
