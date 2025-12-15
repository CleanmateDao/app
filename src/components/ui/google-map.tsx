/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface GoogleMapProps {
  address?: string;
  city?: string;
  country?: string;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export function GoogleMap({
  address,
  city,
  country,
  onLocationSelect,
  className,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      // Don't remove script as it may be used elsewhere
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 6.5244, lng: 3.3792 }, // Lagos default
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const newMarker = new window.google.maps.Marker({
      map: newMap,
      draggable: true,
      visible: false,
    });

    // Handle marker drag
    newMarker.addListener("dragend", () => {
      const position = newMarker.getPosition();
      if (position && onLocationSelect) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            onLocationSelect(
              position.lat(),
              position.lng(),
              results[0].formatted_address
            );
          }
        });
      }
    });

    // Handle map click
    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        newMarker.setPosition(e.latLng);
        newMarker.setVisible(true);

        if (onLocationSelect) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              onLocationSelect(
                e.latLng!.lat(),
                e.latLng!.lng(),
                results[0].formatted_address
              );
            }
          });
        }
      }
    });

    setMap(newMap);
    setMarker(newMarker);
  }, [isLoaded, onLocationSelect]);

  // Geocode address when it changes
  useEffect(() => {
    if (!isLoaded || !map || !marker) return;

    const fullAddress = [address, city, country].filter(Boolean).join(", ");
    if (!fullAddress) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
        marker.setPosition(location);
        marker.setVisible(true);
      }
    });
  }, [address, city, country, isLoaded, map, marker]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-secondary rounded-lg text-center ${className}`}
      >
        <MapPin className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-secondary rounded-lg text-center ${className}`}
      >
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden" />
      <p className="text-xs text-muted-foreground mt-2">
        Click on the map to set the exact location
      </p>
    </div>
  );
}
