import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from "react-leaflet";
import type { Centre } from "../engines/syntheticData";
import type { TransferSuggestion } from "../engines/matchingEngine";

type Props = {
  centres: Centre[];
  deficitCentreIds: Set<string>;
  transfer: TransferSuggestion | null;
  center: [number, number];
};

export default function MapView({ centres, deficitCentreIds, transfer, center }: Props) {
  const byId = new Map(centres.map((c) => [c.id, c]));
  const src = transfer ? byId.get(transfer.fromCentreId) : undefined;
  const dst = transfer ? byId.get(transfer.toCentreId) : undefined;
  const route: [number, number][] | null =
    src && dst
      ? [
          [src.lat, src.lng],
          [dst.lat, dst.lng],
        ]
      : null;

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* radar pulse under every centre that needs stock */}
      {centres
        .filter((c) => deficitCentreIds.has(c.id))
        .map((c) => (
          <CircleMarker
            key={`pulse-${c.id}`}
            center={[c.lat, c.lng]}
            radius={9}
            pathOptions={{
              className: "af-pulse",
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.5,
              weight: 0,
              interactive: false,
            }}
          />
        ))}

      {/* transfer route: soft underlay + animated flowing line on top */}
      {route && (
        <>
          <Polyline positions={route} pathOptions={{ color: "#4f46e5", weight: 7, opacity: 0.18 }} />
          <Polyline
            positions={route}
            pathOptions={{ color: "#4f46e5", weight: 3, className: "af-route" }}
          />
        </>
      )}

      {/* solid, white-ringed centre dots */}
      {centres.map((c) => {
        const deficit = deficitCentreIds.has(c.id);
        const isSrc = src?.id === c.id;
        const isDst = dst?.id === c.id;
        const color = isSrc ? "#4f46e5" : deficit ? "#dc2626" : "#16a34a";
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={isSrc || isDst ? 9 : 6}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 1 }}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-slate-500">
                  {c.type}
                  {isSrc ? " · source" : deficit ? " · needs stock" : " · healthy"}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
