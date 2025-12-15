/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PlaceResult {
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({
  value,
  onPlaceSelect,
  placeholder = "Search for a location...",
  className,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script with Places library
  useEffect(() => {
    if (!apiKey) return;

    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode", "establishment"],
        fields: [
          "formatted_address",
          "geometry",
          "address_components",
          "place_id",
          "name",
        ],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry?.location) return;

      let city = "";
      let country = "";

      place.address_components?.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1") && !city) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
      });

      const result: PlaceResult = {
        address: place.formatted_address || place.name || "",
        city,
        country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id || "",
      };

      setInputValue(result.address);
      onPlaceSelect(result);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onPlaceSelect]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (!apiKey) {
    return (
      <div className={cn("relative", className)}>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10"
      />
      {isLoaded ? (
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      ) : (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      )}
    </div>
  );
}
