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
    const { sub, orgId } = await loadSubscription(event);
    if (sub) await applySubscription(db, sub, orgId);
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

async function loadSubscription(event: Stripe.Event): Promise<{ sub: Stripe.Subscription | null; orgId?: string }> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.subscription) return { sub: null };
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const orgId = session.metadata?.org_id ?? sub.metadata?.org_id;
    return { sub, orgId };
  }
  const sub = event.data.object as Stripe.Subscription;
  return { sub, orgId: sub.metadata?.org_id };
}

async function applySubscription(
  db: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
  orgId?: string,
) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) return;

  const patch = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer as string,
  };

  if (orgId) {
    await db.from("organizations").update(patch).eq("id", orgId);
    return;
  }

  await db.from("organizations").update(patch).eq("stripe_customer_id", sub.customer as string);
}
