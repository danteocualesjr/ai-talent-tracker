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
      if (sub && isActiveSubscription(sub)) {
        const orgId = (event.data.object as Stripe.Checkout.Session).metadata?.org_id;
        await applySubscription(db, sub, orgId);
      }
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      if (isActiveSubscription(sub)) {
        await applySubscription(db, sub, sub.metadata?.org_id);
      } else if (shouldDowngrade(sub)) {
        await downgradeOrg(db, sub);
      }
    } else if (event.type === "customer.subscription.deleted") {
      await downgradeOrg(db, event.data.object as Stripe.Subscription);
    }
  } catch (e) {
    console.error("[stripe] webhook handler failed", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function isActiveSubscription(sub: Stripe.Subscription): boolean {
  return sub.status === "active" || sub.status === "trialing";
}

function shouldDowngrade(sub: Stripe.Subscription): boolean {
  return ["canceled", "unpaid", "incomplete_expired"].includes(sub.status);
}

async function downgradeOrg(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const { error } = await db
    .from("organizations")
    .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
    .eq("stripe_customer_id", sub.customer as string);
  if (error) throw error;
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
  orgId?: string | null,
) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.warn(`[stripe] unknown price id: ${priceId}`);
    return;
  }

  const payload = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
  };

  const byCustomer = await db
    .from("organizations")
    .update(payload)
    .eq("stripe_customer_id", sub.customer as string)
    .select("id");

  if (byCustomer.error) {
    console.error("[stripe] applySubscription failed", byCustomer.error);
    throw byCustomer.error;
  }
  if ((byCustomer.data ?? []).length > 0) return;

  if (orgId) {
    const byOrg = await db.from("organizations").update(payload).eq("id", orgId).select("id");
    if (byOrg.error) {
      console.error("[stripe] applySubscription org fallback failed", byOrg.error);
      throw byOrg.error;
    }
    if ((byOrg.data ?? []).length === 0) {
      console.warn(`[stripe] no org matched customer ${sub.customer} or org ${orgId}`);
    }
  }
}
