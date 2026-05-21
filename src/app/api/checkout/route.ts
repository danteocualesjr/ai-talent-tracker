import { NextRequest, NextResponse } from "next/server";
import { stripe, isAllowedPriceId } from "@/lib/stripe";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";
import { ensureOrgForUser } from "@/lib/org";

export async function POST(req: NextRequest) {
  let priceId: string | undefined;
  try {
    const body = (await req.json()) as { priceId?: string };
    priceId = body.priceId;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!priceId) return NextResponse.json({ error: "missing priceId" }, { status: 400 });
  if (!isAllowedPriceId(priceId)) {
    return NextResponse.json({ error: "invalid priceId" }, { status: 400 });
  }

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await ensureOrgForUser(user.id, user.email ?? null);

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { org_id: org.id },
    });
    customerId = customer.id;
    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", org.id);
    if (error) {
      console.error("[checkout] failed to persist stripe_customer_id", error);
      return NextResponse.json({ error: "failed to save customer" }, { status: 500 });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl()}/app/billing?status=success`,
    cancel_url: `${siteUrl()}/pricing?status=cancelled`,
    allow_promotion_codes: true,
    metadata: { org_id: org.id },
  });

  return NextResponse.json({ url: session.url });
}
