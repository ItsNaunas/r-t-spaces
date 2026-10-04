export const dynamic = "force-dynamic";

import { getPromotion } from "@/lib/promotionStore";
import { PromotionClient } from "./PromotionClient";

export default async function PromotionPage() {
  const promotion = await getPromotion();
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Special Offer</h1>
        <p className="text-sm text-gray-500 mt-1">
          The pop-up, offer prices and block bookings all run from here. When the offer is
          switched off or its end date passes, they all disappear and normal prices come back.
        </p>
      </div>
      <PromotionClient initial={promotion} />
    </div>
  );
}
