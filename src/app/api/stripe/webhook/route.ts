import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

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
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const sub = await loadSubscription(event);
      if (sub) {
        if (ACTIVE_STATUSES.has(sub.status)) {
          await applySubscription(db, sub);
        } else {
          await downgradeByCustomer(db, sub.customer as string);
        }
      }
    }
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await downgradeByCustomer(db, sub.customer as string);
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
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

async function downgradeByCustomer(
  db: ReturnType<typeof createAdminClient>,
  customerId: string,
): Promise<void> {
  const { error } = await db
    .from("organizations")
    .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
    .eq("stripe_customer_id", customerId);
  if (error) throw error;
}

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) return;

  const payload = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer as string,
  };

  const { data: updated, error: byCustomer } = await db
    .from("organizations")
    .update(payload)
    .eq("stripe_customer_id", sub.customer as string)
    .select("id");
  if (byCustomer) throw byCustomer;
  if (updated && updated.length > 0) return;

  let orgId = sub.metadata?.org_id;
  if (!orgId) {
    const customer = await stripe.customers.retrieve(sub.customer as string);
    if (!customer.deleted) orgId = customer.metadata?.org_id;
  }
  if (!orgId) return;

  const { error: byOrg } = await db.from("organizations").update(payload).eq("id", orgId);
  if (byOrg) throw byOrg;
}
