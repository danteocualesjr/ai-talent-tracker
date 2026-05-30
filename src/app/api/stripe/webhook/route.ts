import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP } from "@/lib/stripe";
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

  try {
    if (event.type === "checkout.session.completed") {
      const sub = await loadSubscription(event);
      if (sub) await applySubscription(db, sub);
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "active" || sub.status === "trialing") {
        await applySubscription(db, sub);
      } else if (["past_due", "unpaid", "canceled", "incomplete_expired"].includes(sub.status)) {
        await downgradeSubscription(db, sub);
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await downgradeSubscription(db, sub);
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function loadSubscription(event: Stripe.Event): Promise<Stripe.Subscription | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.subscription) return null;
    return await stripe.subscriptions.retrieve(session.subscription as string);
  }
  return event.data.object as Stripe.Subscription;
}

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("[stripe webhook] subscription missing price id", sub.id);
    return;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.error("[stripe webhook] unknown price id — check STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM env vars", priceId);
    throw new Error(`unmapped Stripe price: ${priceId}`);
  }

  const { error } = await db
    .from("organizations")
    .update({
      plan: mapping.plan,
      profile_limit: mapping.profile_limit,
      refresh_cadence: mapping.cadence,
      stripe_subscription_id: sub.id,
    })
    .eq("stripe_customer_id", sub.customer as string);
  if (error) throw error;
}

async function downgradeSubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const { error } = await db
    .from("organizations")
    .update({
      plan: "free",
      profile_limit: 5,
      refresh_cadence: "weekly",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", sub.customer as string);
  if (error) throw error;
}
