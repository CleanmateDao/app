/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Navigation, X } from "lucide-react";
import { Cleanup, CleanupStatus } from "@/types/cleanup";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import cleanupMarkerIcon from "@/assets/cleanup-marker.png";

interface CleanupMapProps {
  cleanups: Cleanup[];
  className?: string;
}

const statusConfig: Record<CleanupStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "#22c55e" },
  in_progress: { label: "In Progress", color: "#f97316" },
  completed: { label: "Completed", color: "#8b5cf6" },
  rewarded: { label: "Rewarded", color: "#06b6d4" },
};

const lightMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

// Calculate distance between two coordinates in km
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function CleanupMap({ cleanups, className }: CleanupMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const { theme } = useTheme();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.log("Geolocation error:", err.message);
        }
      );
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      if (window.google?.maps) {
        setIsLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const center = userLocation || { lat: 6.5244, lng: 3.3792 }; // Use user location or Lagos default

    const newMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 11,
      styles: theme === "dark" ? darkMapStyles : lightMapStyles,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    // Initialize directions renderer
    const renderer = new window.google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });
    setDirectionsRenderer(renderer);

    setMap(newMap);
  }, [isLoaded, map, theme, userLocation]);

  // Update map styles when theme changes
  useEffect(() => {
    if (!map) return;
    map.setOptions({
      styles: theme === "dark" ? darkMapStyles : lightMapStyles,
    });
  }, [map, theme]);

  useEffect(() => {
    if (!map || !userLocation) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: "Your Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    userMarkerRef.current = marker;
  }, [map, userLocation]);

  // Add markers for cleanups
  useEffect(() => {
    if (!map || !isLoaded || !infoWindow) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];

    // Include user location in bounds
    if (userLocation) {
      bounds.extend(userLocation);
    }

    cleanups.forEach((cleanup) => {
      if (!cleanup.location.latitude || !cleanup.location.longitude) return;

      const position = {
        lat: cleanup.location.latitude,
        lng: cleanup.location.longitude,
      };

      // Calculate distance from user
      let distanceText = "";
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          cleanup.location.latitude,
          cleanup.location.longitude
        );
        distanceText = `🚶 ${formatDistance(distance)} away`;
      }

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: cleanup.title,
        icon: {
          url: cleanupMarkerIcon,
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32),
        },
      });

      marker.addListener("click", () => {
        const routeButtonText =
          activeRoute === cleanup.id ? "Hide Route" : "Show Route";
        const content = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${
              cleanup.title
            }</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              📍 ${cleanup.location.address}
            </p>
            ${
              distanceText
                ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #4285F4; font-weight: 500;">${distanceText}</p>`
                : ""
            }
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
              📅 ${cleanup.date} • ${cleanup.startTime} - ${cleanup.endTime}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              👥 ${
                cleanup.participants.filter((p) => p.status === "accepted")
                  .length
              }/${cleanup.maxParticipants} participants
            </p>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                background: ${statusConfig[cleanup.status].color}20;
                color: ${statusConfig[cleanup.status].color};
              ">
                ${statusConfig[cleanup.status].label}
              </span>
              <a href="/cleanups/${cleanup.id}" style="
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                background: #f97316;
                color: white;
                text-decoration: none;
              ">
                View Details
              </a>
            </div>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.open(map, marker);

        // Show route if user location is available
        if (userLocation && directionsRenderer) {
          const directionsService = new window.google.maps.DirectionsService();

          if (activeRoute === cleanup.id) {
            // Clear route if clicking same marker
            directionsRenderer.setDirections({
              routes: [],
            } as google.maps.DirectionsResult);
            setActiveRoute(null);
          } else {
            // Show route to this cleanup
            directionsService.route(
              {
                origin: userLocation,
                destination: position,
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === "OK" && result) {
                  directionsRenderer.setDirections(result);
                  setActiveRoute(cleanup.id);
                  // Re-open InfoWindow after route is displayed to keep it visible
                  setTimeout(() => {
                    infoWindow.open(map, marker);
                  }, 100);
                }
              }
            );
          }
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    // Fit map to bounds if we have markers
    if (newMarkers.length > 0 || userLocation) {
      map.fitBounds(bounds);

      // Don't zoom in too much
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [
    cleanups,
    map,
    isLoaded,
    infoWindow,
    userLocation,
    directionsRenderer,
    activeRoute,
  ]);

  const centerOnUser = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({
        routes: [],
      } as google.maps.DirectionsResult);
      setActiveRoute(null);
    }
  };

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-12 bg-secondary rounded-lg text-center ${className}`}
      >
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-12 bg-secondary rounded-lg text-center ${className}`}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px] rounded-lg overflow-hidden"
      />

      {/* My Location Button - positioned lower to avoid overlap with page header */}
      <div className="absolute top-24 right-4 flex gap-2 z-10">
        {activeRoute && (
          <Button
            size="sm"
            variant="destructive"
            className="shadow-lg"
            onClick={clearRoute}
          >
            <X className="w-4 h-4 mr-1" />
            Clear Route
          </Button>
        )}
        {userLocation && (
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={centerOnUser}
          >
            <Navigation className="w-4 h-4 mr-1" />
            My Location
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <p className="text-xs font-medium mb-2">Status</p>
        <div className="space-y-1.5">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-muted-foreground">
                {config.label}
              </span>
            </div>
          ))}
          {userLocation && (
            <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
              <div className="w-3 h-3 rounded-full bg-[#4285F4] border-2 border-white" />
              <span className="text-xs text-muted-foreground">You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
