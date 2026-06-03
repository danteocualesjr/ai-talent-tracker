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
      if (sub.status === "active" || sub.status === "trialing") {
        await applySubscription(db, sub);
      } else if (
        sub.status === "canceled" ||
        sub.status === "unpaid" ||
        sub.status === "past_due" ||
        sub.status === "incomplete_expired"
      ) {
        await downgradeSubscription(db, sub);
      }
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", sub.customer as string);
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

async function resolveOrgId(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.org_id) return sub.metadata.org_id;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return customer.metadata?.org_id ?? null;
}

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) return;

  const update = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
  };

  const orgId = await resolveOrgId(sub);
  if (orgId) {
    await db.from("organizations").update(update).eq("id", orgId);
    return;
  }

  await db.from("organizations").update(update).eq("stripe_customer_id", sub.customer as string);
}

async function downgradeSubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const free = {
    plan: "free" as const,
    profile_limit: 5,
    refresh_cadence: "weekly" as const,
    stripe_subscription_id: null,
  };
  const orgId = await resolveOrgId(sub);
  if (orgId) {
    await db.from("organizations").update(free).eq("id", orgId);
    return;
  }
  await db.from("organizations").update(free).eq("stripe_customer_id", sub.customer as string);
}
