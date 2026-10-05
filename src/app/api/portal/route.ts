import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";
import { ensureOrgForUser } from "@/lib/org";

export async function POST() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  if (!org.stripe_customer_id) return NextResponse.json({ error: "no customer" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${siteUrl()}/app/billing`,
  });
  if (!session.url) return NextResponse.json({ error: "portal unavailable" }, { status: 500 });
  // The billing page calls this with fetch() and reads `url` from JSON; a
  // redirect here would make fetch chase Stripe cross-origin and fail.
  return NextResponse.json({ url: session.url });
}
