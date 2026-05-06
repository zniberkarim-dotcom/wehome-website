import { useEffect, useRef, useState, useCallback } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { MapPin } from "lucide-react";
import type { Property } from "@/lib/data";

// Configure Maps API key once at module load
setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
  v: "weekly",
});

// ── Map style — warm premium light ───────────────────────────────────────────

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "all",                     elementType: "geometry",            stylers: [{ color: "#f2ede8" }] },
  { featureType: "all",                     elementType: "labels.icon",         stylers: [{ visibility: "off" }] },
  { featureType: "all",                     elementType: "labels.text.fill",    stylers: [{ color: "#6b5c52" }] },
  { featureType: "all",                     elementType: "labels.text.stroke",  stylers: [{ color: "#f2ede8" }] },
  { featureType: "administrative",          elementType: "geometry",            stylers: [{ visibility: "off" }] },
  { featureType: "administrative.country",  elementType: "geometry.stroke",     stylers: [{ color: "#c9b8ad" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke",     stylers: [{ color: "#d9cbc3" }] },
  { featureType: "landscape.natural",       elementType: "geometry",            stylers: [{ color: "#e8e0d8" }] },
  { featureType: "poi",                     elementType: "all",                 stylers: [{ visibility: "off" }] },
  { featureType: "road",                    elementType: "geometry",            stylers: [{ color: "#ffffff" }] },
  { featureType: "road",                    elementType: "geometry.stroke",     stylers: [{ color: "#e0d5ce" }] },
  { featureType: "road.arterial",           elementType: "labels.text.fill",    stylers: [{ color: "#8c7b70" }] },
  { featureType: "road.highway",            elementType: "geometry",            stylers: [{ color: "#e8ddd5" }] },
  { featureType: "road.highway",            elementType: "labels.text.fill",    stylers: [{ color: "#8c7b70" }] },
  { featureType: "road.local",              elementType: "labels.text.fill",    stylers: [{ color: "#b0a099" }] },
  { featureType: "transit",                 elementType: "all",                 stylers: [{ visibility: "off" }] },
  { featureType: "water",                   elementType: "geometry",            stylers: [{ color: "#c5d8e8" }] },
  { featureType: "water",                   elementType: "labels.text.fill",    stylers: [{ color: "#8fafc4" }] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number, isRental: boolean): string {
  if (isRental) {
    if (price >= 1_000) return `${Math.round(price / 1_000)}k/m`;
    return `${price.toLocaleString("fr-MA")}/m`;
  }
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (price >= 1_000) return `${Math.round(price / 1_000)}k`;
  return price.toLocaleString("fr-MA");
}

function makePillSvg(label: string, highlighted = false): string {
  const charWidth = 7.5;
  const padding = 22;
  const width = Math.max(68, Math.ceil(label.length * charWidth) + padding);
  const bg = highlighted ? "#8B1A1A" : "#C0392B";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="30">
    <rect width="${width}" height="30" rx="15" fill="${bg}" />
    <text x="${width / 2}" y="20" text-anchor="middle"
          font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="600" fill="#ffffff">
      ${label}
    </text>
  </svg>`;
}

function makeMarkerIcon(
  price: number,
  isRental: boolean,
  highlighted = false
): google.maps.Icon {
  const label = formatPrice(price, isRental);
  const svg = makePillSvg(label, highlighted);
  const charWidth = 7.5;
  const padding = 22;
  const width = Math.max(68, Math.ceil(label.length * charWidth) + padding);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, 30),
    anchor: new google.maps.Point(width / 2, 15),
  };
}

function makeClusterSvg(count: number): string {
  const size = count < 10 ? 36 : count < 50 ? 42 : 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#C0392B" fill-opacity="0.92"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="none" stroke="white" stroke-width="1.5" stroke-opacity="0.45"/>
    <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle"
          font-family="Inter,sans-serif" font-size="${count > 99 ? 11 : 13}" font-weight="700" fill="white">
      ${count}
    </text>
  </svg>`;
}

// ── InfoWindow HTML ───────────────────────────────────────────────────────────

function makeInfoHtml(p: Property): string {
  const imgSrc = p.photoUrl ?? (p.photos && p.photos[0]) ?? "";
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="" style="width:100%;height:140px;object-fit:cover;display:block;" />`
    : `<div style="width:100%;height:80px;background:#f0ebe6;display:flex;align-items:center;justify-content:center;font-size:28px;">🏠</div>`;

  const priceStr = p.isRental
    ? `${p.price.toLocaleString("fr-MA")} MAD/mois`
    : `${p.price.toLocaleString("fr-MA")} MAD`;

  const specs: string[] = [];
  if (p.beds) specs.push(`${p.beds} ch.`);
  if (p.surface) specs.push(`${p.surface} m²`);

  return `
  <div style="width:230px;font-family:Inter,system-ui,sans-serif;margin:-10px -14px -14px;border-radius:10px;overflow:hidden;">
    ${imgHtml}
    <div style="padding:12px 14px 14px;">
      <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#1a1208;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${p.title}
      </p>
      <p style="margin:0 0 6px;font-size:11px;color:#8c7b70;">📍 ${p.location}</p>
      ${specs.length ? `<p style="margin:0 0 8px;font-size:11px;color:#6b5c52;">${specs.join(" &nbsp;·&nbsp; ")}</p>` : ""}
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#C0392B;">${priceStr}</p>
      <a href="/bien/${p.id}" style="display:block;text-align:center;padding:8px 12px;background:#C0392B;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">
        Voir le bien →
      </a>
    </div>
  </div>`;
}


// ── Component ─────────────────────────────────────────────────────────────────

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

// Extended marker type to carry property id
type TaggedMarker = google.maps.Marker & { _propId?: string };

export function PropertyMap({ properties, className = "" }: PropertyMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<TaggedMarker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const mappable = properties.filter(
    (p): p is Property & { lat: number; lng: number } =>
      typeof p.lat === "number" && typeof p.lng === "number"
  );

  // ── Initialise map once the Google Maps script is loaded ──────────────────
  useEffect(() => {
    if (!mapDivRef.current) return;
    let cancelled = false;

    importLibrary("maps")
      .then(() => {
        if (cancelled || !mapDivRef.current || mapRef.current) return;

        const map = new google.maps.Map(mapDivRef.current, {
          center: { lat: 31.79, lng: -7.09 },
          zoom: 6,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        const iw = new google.maps.InfoWindow({ maxWidth: 258 });

        map.addListener("click", () => {
          iw.close();
          resetActiveMarker();
          activeIdRef.current = null;
        });

        mapRef.current = map;
        infoWindowRef.current = iw;
        setIsReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(String(err));
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: reset previously highlighted marker ───────────────────────────
  function resetActiveMarker() {
    if (!activeIdRef.current) return;
    const prev = markersRef.current.find((m) => m._propId === activeIdRef.current);
    const prevProp = mappable.find((p) => p.id === activeIdRef.current);
    if (prev && prevProp) {
      prev.setIcon(makeMarkerIcon(prevProp.price, prevProp.isRental, false));
    }
  }

  // ── Re-place markers whenever properties or map readiness changes ─────────
  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;

    // Clear old markers
    clustererRef.current?.clearMarkers();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.close();
    activeIdRef.current = null;

    if (mappable.length === 0) return;

    const newMarkers: TaggedMarker[] = mappable.map((prop) => {
      const marker: TaggedMarker = new google.maps.Marker({
        position: { lat: prop.lat, lng: prop.lng },
        icon: makeMarkerIcon(prop.price, prop.isRental, false),
        optimized: false,
        title: prop.title,
      });
      marker._propId = prop.id;

      marker.addListener("click", () => {
        const iw = infoWindowRef.current;
        if (!iw) return;

        // Reset previous
        if (activeIdRef.current && activeIdRef.current !== prop.id) {
          resetActiveMarker();
        }

        // Highlight this marker
        marker.setIcon(makeMarkerIcon(prop.price, prop.isRental, true));
        activeIdRef.current = prop.id;

        iw.setContent(makeInfoHtml(prop));
        iw.open({ map, anchor: marker });
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Clusterer with custom burgundy renderer
    clustererRef.current = new MarkerClusterer({
      map,
      markers: newMarkers,
      renderer: {
        render({ count, position }) {
          const size = count < 10 ? 36 : count < 50 ? 42 : 48;
          return new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makeClusterSvg(count))}`,
              scaledSize: new google.maps.Size(size, size),
              anchor: new google.maps.Point(size / 2, size / 2),
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            optimized: false,
          });
        },
      },
    });

    // Fit map to markers
    if (mappable.length === 1) {
      map.setCenter({ lat: mappable[0].lat, lng: mappable[0].lng });
      map.setZoom(14);
    } else {
      const bounds = new google.maps.LatLngBounds();
      mappable.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [isReady, mappable]);

  useEffect(() => {
    syncMarkers();
    return () => {
      clustererRef.current?.clearMarkers();
      markersRef.current.forEach((m) => m.setMap(null));
    };
  }, [syncMarkers]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 rounded-2xl ${className}`}>
        <div className="text-center p-8">
          <MapPin size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Impossible de charger la carte</p>
          <p className="text-xs text-muted-foreground">
            Vérifiez la clé Google Maps dans le fichier .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      {/* Map canvas */}
      <div ref={mapDivRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Chargement de la carte…</p>
          </div>
        </div>
      )}

      {/* Count badge */}
      {isReady && mappable.length > 0 && (
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
            {mappable.length} {mappable.length === 1 ? "bien" : "biens"} sur la carte
          </div>
        </div>
      )}

      {/* No GPS badge */}
      {isReady && mappable.length === 0 && properties.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm border border-border rounded-2xl px-6 py-4 text-center shadow-md max-w-xs">
            <MapPin size={28} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">Coordonnées GPS manquantes</p>
            <p className="text-xs text-muted-foreground">
              Les biens filtrés n'ont pas encore de position GPS renseignée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
