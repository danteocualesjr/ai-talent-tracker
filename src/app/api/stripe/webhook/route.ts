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

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const sub = await loadSubscription(event);
    if (sub) {
      const err = await applySubscription(db, sub);
      if (err) {
        console.error("[stripe webhook] subscription update failed:", err);
        return NextResponse.json({ error: err }, { status: 500 });
      }
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const { error } = await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", sub.customer as string);
    if (error) {
      console.error("[stripe webhook] subscription.deleted update failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

async function applySubscription(
  db: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("[stripe webhook] subscription has no price item");
    return null;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.warn(`[stripe webhook] unknown price id: ${priceId}`);
    return null;
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
  if (error) return error.message;
  return null;
}
