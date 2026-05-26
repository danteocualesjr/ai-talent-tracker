import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP, stripeResourceId, subscriptionGrantsPlan } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `invalid signature: ${(e as Error).message}` }, { status: 400 });
  }

  const db = createAdminClient();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const sub = await loadSubscription(event);
    if (sub) {
      if (subscriptionGrantsPlan(sub)) {
        await applySubscription(db, sub);
      } else {
        await clearSubscriptionPlan(db, sub);
      }
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await clearSubscriptionPlan(db, sub);
  }

  return NextResponse.json({ received: true });
}

async function loadSubscription(event: Stripe.Event): Promise<Stripe.Subscription | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subId = stripeResourceId(session.subscription);
    if (!subId) return null;
    return await stripe.subscriptions.retrieve(subId);
  }
  return event.data.object as Stripe.Subscription;
}

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) return;

  const customerId = stripeResourceId(sub.customer);
  if (!customerId) return;

  const { error } = await db
    .from("organizations")
    .update({
      plan: mapping.plan,
      profile_limit: mapping.profile_limit,
      refresh_cadence: mapping.cadence,
      stripe_subscription_id: sub.id,
    })
    .eq("stripe_customer_id", customerId);
  if (error) console.error("[stripe webhook] applySubscription failed", error);
}

async function clearSubscriptionPlan(
  db: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
) {
  const customerId = stripeResourceId(sub.customer);
  if (!customerId) return;

  const { error } = await db
    .from("organizations")
    .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
    .eq("stripe_customer_id", customerId);
  if (error) console.error("[stripe webhook] clearSubscriptionPlan failed", error);
}
