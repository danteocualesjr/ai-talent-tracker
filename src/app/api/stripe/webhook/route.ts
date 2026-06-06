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
    if (sub) await applySubscription(db, sub, event);
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = stripeCustomerId(sub.customer);
    if (!customerId) return NextResponse.json({ received: true });
    await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", customerId);
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
  event: Stripe.Event,
) {
  const customerId = stripeCustomerId(sub.customer);
  const isActive = sub.status === "active" || sub.status === "trialing";

  if (!isActive) {
    if (!customerId) return;
    await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", customerId);
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("[stripe] subscription missing price id", sub.id);
    return;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.warn("[stripe] unknown price id", priceId);
    return;
  }

  const orgId =
    event.type === "checkout.session.completed"
      ? (event.data.object as Stripe.Checkout.Session).metadata?.org_id
      : sub.metadata?.org_id;

  const update = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
  };

  if (orgId) {
    const { data, error } = await db.from("organizations").update(update).eq("id", orgId).select("id");
    if (error) console.error("[stripe] failed to update org by id", orgId, error);
    else if (!data?.length) console.warn("[stripe] no org matched org_id", orgId);
    return;
  }

  if (!customerId) {
    console.warn("[stripe] subscription missing customer id", sub.id);
    return;
  }

  const { data, error } = await db
    .from("organizations")
    .update(update)
    .eq("stripe_customer_id", customerId)
    .select("id");
  if (error) console.error("[stripe] failed to update org by customer", customerId, error);
  else if (!data?.length) console.warn("[stripe] no org matched stripe_customer_id", customerId);
}

function stripeCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id;
}
