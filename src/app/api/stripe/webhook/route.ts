import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { Plan, RefreshCadence } from "@/types/db";

export const runtime = "nodejs";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

const FREE_PLAN = {
  plan: "free" as Plan,
  profile_limit: 5,
  refresh_cadence: "weekly" as RefreshCadence,
};

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
      if (sub) await applySubscription(db, sub);
    }
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const downgraded = await downgradeOrg(db, sub.customer as string);
      if (!downgraded) {
        return NextResponse.json({ error: "org not found for customer" }, { status: 500 });
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
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
  if (!ACTIVE_STATUSES.has(sub.status)) {
    const ok = await downgradeOrg(db, sub.customer as string);
    if (!ok) throw new Error(`org not found for customer ${sub.customer}`);
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return;
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.warn("[stripe webhook] unmapped price", priceId);
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
  if (byCustomer.data?.length) return;

  const customer = await stripe.customers.retrieve(sub.customer as string);
  if (customer.deleted) throw new Error("stripe customer deleted");
  const orgId = customer.metadata?.org_id;
  if (!orgId) throw new Error(`org not found for customer ${sub.customer}`);

  const byOrgId = await db.from("organizations").update(payload).eq("id", orgId).select("id");
  if (!byOrgId.data?.length) throw new Error(`org ${orgId} not found`);
}

async function downgradeOrg(
  db: ReturnType<typeof createAdminClient>,
  customerId: string,
): Promise<boolean> {
  const { data } = await db
    .from("organizations")
    .update({ ...FREE_PLAN, stripe_subscription_id: null })
    .eq("stripe_customer_id", customerId)
    .select("id");
  return (data?.length ?? 0) > 0;
}
