import { createClient } from "@/utils/supabase/client";
import { ensureClaimerSession } from "@/utils/supabase/guest";

// Row level security makes sure people only change their own Claims; these
// just surface the database's error message if something is refused.
function check({ error }: { error: { message: string } | null }) {
  if (error) throw new Error(error.message);
}

export async function createClaim(wishId: string, claimerName: string) {
  await ensureClaimerSession();
  // Recurring Wishes are forced to "bought" by the database.
  check(
    await createClient()
      .from("claims")
      .insert({ wish_id: wishId, claimer_name: claimerName }),
  );
}

export async function markBought(claimId: string) {
  check(
    await createClient()
      .from("claims")
      .update({ status: "bought" })
      .eq("id", claimId),
  );
}

export async function cancelClaim(claimId: string) {
  check(await createClient().from("claims").delete().eq("id", claimId));
}
