import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PAID_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

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
      if (PAID_STATUSES.has(sub.status)) {
        const ok = await applySubscription(db, sub);
        if (!ok) return NextResponse.json({ error: "db update failed" }, { status: 500 });
      } else {
        const ok = await downgradeSubscription(db, sub);
        if (!ok) return NextResponse.json({ error: "db update failed" }, { status: 500 });
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
      console.error("[stripe webhook] downgrade failed", error);
      return NextResponse.json({ error: "db update failed" }, { status: 500 });
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

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription): Promise<boolean> {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.error("[stripe webhook] subscription missing price id", sub.id);
    return false;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.error("[stripe webhook] unknown price id", priceId);
    return false;
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
  if (error) {
    console.error("[stripe webhook] apply subscription failed", error);
    return false;
  }
  return true;
}

async function downgradeSubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription): Promise<boolean> {
  const { error } = await db
    .from("organizations")
    .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
    .eq("stripe_customer_id", sub.customer as string);
  if (error) {
    console.error("[stripe webhook] downgrade subscription failed", error);
    return false;
  }
  return true;
}
