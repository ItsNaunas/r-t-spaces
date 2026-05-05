import { getMergedPackages } from "@/lib/admin/pricing-merged";
import { PackagesClient } from "./PackagesClient";

export default async function PackagesPage() {
  const packages = await getMergedPackages();
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Packages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable packages and override prices. Changes take effect immediately.
        </p>
      </div>
      <PackagesClient initialPackages={packages} />
    </div>
  );
}
