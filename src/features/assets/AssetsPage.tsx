import { useEffect, useState } from "react";
import { useEstateScope } from "../../hooks/useEstateScope";
import AssetsListPage from "./AssetsListPage";
import PropertyDetail from "./PropertyDetail";
import type { AssetKind, Property } from "../../types/asset";

export type { AssetKind };

export default function AssetsPage({ kind }: { kind: AssetKind }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { estateId } = useEstateScope();

  // Switching between Fixed and Mobile returns to that list.
  useEffect(() => setSelectedId(null), [kind]);

  if (selectedId) {
    return (
      <PropertyDetail
        propertyId={selectedId}
        estateId={estateId ?? ""}
        kind={kind}
        onBack={() => setSelectedId(null)}
      />
    );
  }
  return <AssetsListPage kind={kind} onView={(p: Property) => setSelectedId(p.id)} />;
}
