import React, { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CscCenter } from "@/types/schema";
import { Plus, Minus, Crosshair, Info, ArrowRight, Check } from "lucide-react";

interface CscInteractiveMapProps {
  centers: CscCenter[];
  activeCenterId: string;
  onSelectCenter: (centerId: string) => void;
  showOnlyOpen: boolean;
  onToggleShowOnlyOpen: () => void;
  onOpenLearnMore: () => void;
  isHindi: boolean;
}

export const CscInteractiveMap: React.FC<CscInteractiveMapProps> = ({
  centers,
  activeCenterId,
  onSelectCenter,
  showOnlyOpen,
  onToggleShowOnlyOpen,
  onOpenLearnMore,
  isHindi,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const isUserInteractingRef = useRef<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: India / Jaipur
    const map = L.map(mapContainerRef.current, {
      center: [26.8532, 75.8197],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean, modern CartoDB Voyager tiles (OpenStreetMap data)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // Attribution
    L.control
      .attribution({
        position: "bottomright",
        prefix:
          '<span class="text-[9px] text-gray-400 opacity-80">&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" class="hover:underline">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer" class="hover:underline">CARTO</a></span>',
      })
      .addTo(map);

    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Helper to create custom HTML Pin
  const createPinIcon = useCallback((isSelected: boolean) => {
    return L.divIcon({
      className: "custom-csc-div-icon",
      iconSize: isSelected ? [38, 48] : [32, 40],
      iconAnchor: isSelected ? [19, 46] : [16, 38],
      popupAnchor: [0, -40],
      html: `
        <div class="relative group cursor-pointer transition-all duration-200">
          ${
            isSelected
              ? '<div class="absolute -inset-2 rounded-full bg-[#107152]/30 animate-ping pointer-events-none"></div>'
              : ""
          }
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform ${
            isSelected
              ? "bg-[#107152] scale-110 shadow-emerald-900/30"
              : "bg-[#0E5B42] hover:scale-105"
          }">
            <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="w-2 h-1 bg-black/20 rounded-full mx-auto mt-0.5 blur-[1px]"></div>
        </div>
      `,
    });
  }, []);

  // Update Markers when centers list or activeCenterId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const validCenters = centers.filter(
      (c) =>
        c.latitude &&
        c.longitude &&
        !isNaN(Number(c.latitude)) &&
        !isNaN(Number(c.longitude))
    );

    if (validCenters.length === 0) return;

    const bounds = L.latLngBounds([]);

    validCenters.forEach((center) => {
      const lat = Number(center.latitude);
      const lng = Number(center.longitude);
      const isSelected = center.id === activeCenterId;

      bounds.extend([lat, lng]);

      const icon = createPinIcon(isSelected);
      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 10,
      }).addTo(map);

      // Create Custom Rich Popup
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const statusBadge = center.is_open
        ? `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#107152] bg-[#EAF7F0] px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-[#107152]"></span>${
            center.status_text || (isHindi ? "खुला है" : "Open Now")
          }</span>`
        : `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>${
            center.status_text || (isHindi ? "बंद है" : "Closed")
          }</span>`;

      const popupHtml = `
        <div style="font-family: inherit; color: #111827; min-width: 210px; padding: 3px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #9CA3AF; text-transform: uppercase;">CSC Kendra</span>
            ${statusBadge}
          </div>
          <h4 style="font-size: 13px; font-weight: 700; line-height: 1.25; color: #111827; margin: 0 0 4px 0;">
            ${center.center_name}
          </h4>
          <p style="font-size: 11px; color: #6B7280; margin: 0 0 6px 0; line-height: 1.35;">
            📍 ${center.address}
          </p>
          ${
            center.phone
              ? `<p style="font-size: 11px; font-weight: 500; color: #374151; margin: 0 0 8px 0;">📞 ${center.phone}</p>`
              : ""
          }
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #F3F4F6; gap: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: #107152;">
              ${center.distance || "1.2 km"} away
            </span>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
               style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 8px; background-color: #107152; color: #ffffff; font-size: 11px; font-weight: 600; text-decoration: none;">
              <span>${isHindi ? "रास्ता देखें" : "Directions"}</span>
              <span style="font-size: 12px;">→</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "custom-csc-popup",
        maxWidth: 280,
        closeButton: false,
      });

      marker.on("click", () => {
        isUserInteractingRef.current = true;
        onSelectCenter(center.id);
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 800);
      });

      markersRef.current.set(center.id, marker);
    });

    // If active center exists, fly to it and open its popup
    const activeCenter = validCenters.find((c) => c.id === activeCenterId);
    if (activeCenter) {
      const activeMarker = markersRef.current.get(activeCenter.id);
      if (activeMarker) {
        const lat = Number(activeCenter.latitude);
        const lng = Number(activeCenter.longitude);

        if (!isUserInteractingRef.current) {
          map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
            duration: 0.9,
          });
        }
        activeMarker.openPopup();
      }
    } else if (bounds.isValid() && !isUserInteractingRef.current) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
        animate: true,
      });
    }
  }, [centers, activeCenterId, createPinIcon, onSelectCenter, isHindi]);

  // Map Controls Callbacks
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const validCenters = centers.filter(
      (c) =>
        c.latitude &&
        c.longitude &&
        !isNaN(Number(c.latitude)) &&
        !isNaN(Number(c.longitude))
    );

    if (validCenters.length === 0) return;

    const activeCenter = validCenters.find((c) => c.id === activeCenterId);
    if (activeCenter) {
      map.flyTo(
        [Number(activeCenter.latitude), Number(activeCenter.longitude)],
        14,
        { duration: 0.8 }
      );
      const marker = markersRef.current.get(activeCenter.id);
      marker?.openPopup();
    } else {
      const bounds = L.latLngBounds(
        validCenters.map((c) => [Number(c.latitude), Number(c.longitude)])
      );
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200/90 overflow-hidden relative shadow-xs bg-[#EAF3EC] min-h-[520px] sm:min-h-[600px] flex flex-col justify-between select-none">
      {/* Real Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* TOP OVERLAYS: Filter Toggle + Zoom Controls */}
      <div className="relative z-10 p-4 flex items-start justify-between pointer-events-none">
        {/* Show only open centers checkbox pill */}
        <button
          onClick={onToggleShowOnlyOpen}
          className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-gray-200/80 text-xs font-semibold text-[#111827] shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:bg-white active:scale-95"
        >
          <div
            className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition-colors ${
              showOnlyOpen
                ? "bg-[#107152] text-white"
                : "border border-gray-400 bg-white"
            }`}
          >
            {showOnlyOpen && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>{isHindi ? "केवल खुले केंद्र दिखाएं" : "Show only open centers"}</span>
        </button>

        {/* Map Zoom / Controls Stack */}
        <div className="pointer-events-auto flex flex-col space-y-1 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/80 p-1 shadow-xs">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-gray-200 mx-1" />
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-gray-200 mx-1" />
          <button
            onClick={handleRecenter}
            title="Recenter"
            aria-label="Recenter Map"
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM INFO BANNER OVERLAY ON MAP */}
      <div className="relative z-10 mx-3 mb-3 p-3 sm:px-4 sm:py-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-3 text-xs pointer-events-auto">
        <div className="flex items-center gap-2.5 text-[#374151]">
          <div className="w-5 h-5 rounded-full bg-[#EAF7F0] text-[#107152] flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="line-clamp-2 leading-relaxed font-medium">
            {isHindi
              ? "CSC केंद्र योजना आवेदन, दस्तावेज़ सत्यापन आदि में निःशुल्क/निर्धारित शुल्क पर सहायता प्रदान करते हैं।"
              : "CSC centers provide assistance with scheme applications, document verification, and more."}
          </span>
        </div>

        <button
          onClick={onOpenLearnMore}
          className="text-[#107152] font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <span>{isHindi ? "और जानें" : "Learn More"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
