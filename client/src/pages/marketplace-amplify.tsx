import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";

export default function Marketplace() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600">Discover community resources and services</p>
      </div>

      <MarketplaceGrid />
    </div>
  );
}