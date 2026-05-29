import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";
import { ensureOrgForUser } from "@/lib/org";

export async function POST(req: NextRequest) {
  const { priceId } = (await req.json()) as { priceId?: string };
  if (!priceId) return NextResponse.json({ error: "missing priceId" }, { status: 400 });

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
    const admin = (await import("@/lib/supabase/server")).createAdminClient();
    const { data: updated } = await admin
      .from("organizations")
      .update({ stripe_customer_id: customer.id })
      .eq("id", org.id)
      .is("stripe_customer_id", null)
      .select("stripe_customer_id")
      .maybeSingle();

    if (updated?.stripe_customer_id) {
      customerId = updated.stripe_customer_id;
    } else {
      const { data: fresh } = await admin
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", org.id)
        .single();
      customerId = fresh?.stripe_customer_id ?? customer.id;
    }
  }

  if (!customerId) {
    return NextResponse.json({ error: "customer setup failed" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl()}/app/billing?status=success`,
    cancel_url: `${siteUrl()}/pricing?status=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
