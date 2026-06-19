import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com';

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

Deno.serve(async () => {
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response('Missing push configuration', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date().toISOString();

  const { data: jobs, error: jobsError } = await supabase
    .from('timer_notification_jobs')
    .select('id, user_id, timer_id, timer_name, completion_key')
    .is('sent_at', null)
    .lte('fire_at', now)
    .limit(100);

  if (jobsError) {
    return new Response(jobsError.message, { status: 500 });
  }

  let sent = 0;

  for (const job of jobs ?? []) {
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', job.user_id);

    if (subError || !subscriptions?.length) {
      await supabase
        .from('timer_notification_jobs')
        .update({ sent_at: now })
        .eq('id', job.id);
      continue;
    }

    const payload = JSON.stringify({
      title: job.timer_name,
      body: 'Your timer is ready!',
      tag: `timer-${job.timer_id}`,
      completionKey: job.completion_key,
    });

    let delivered = false;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
        delivered = true;
      } catch (error) {
        console.error('push failed', subscription.endpoint, error);
      }
    }

    if (delivered) {
      sent += 1;
      await supabase
        .from('timer_notification_jobs')
        .update({ sent_at: now })
        .eq('id', job.id);
    }
  }

  return Response.json({ checked: jobs?.length ?? 0, sent });
});