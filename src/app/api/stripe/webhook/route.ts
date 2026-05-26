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
    if (sub) await applySubscription(db, sub);
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = stripeCustomerId(sub.customer);
    if (!customerId) {
      console.error("[stripe] subscription.deleted missing customer id", sub.id);
      return NextResponse.json({ received: true });
    }
    const { error } = await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", customerId);
    if (error) console.error("[stripe] failed to downgrade org", customerId, error.message);
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
    console.error("[stripe] subscription missing price id", sub.id);
    return;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.error("[stripe] unknown price id", priceId, "for subscription", sub.id);
    return;
  }

  const customerId = stripeCustomerId(sub.customer);
  if (!customerId) {
    console.error("[stripe] subscription missing customer id", sub.id);
    return;
  }

  const { error } = await db
    .from("organizations")
    .update({
      plan: mapping.plan,
      profile_limit: mapping.profile_limit,
      refresh_cadence: mapping.cadence,
      stripe_subscription_id: sub.id,
    })
    .eq("stripe_customer_id", customerId);
  if (error) console.error("[stripe] failed to apply subscription", customerId, error.message);
}

function stripeCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string | null {
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer && typeof customer.id === "string") {
    return customer.id;
  }
  return null;
}
