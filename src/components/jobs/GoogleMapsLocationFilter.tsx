import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    Geocoder: new () => GoogleGeocoder;
    places?: {
      Autocomplete: new (input: HTMLInputElement, options?: Record<string, unknown>) => GoogleAutocomplete;
    };
  };
};

type GoogleMap = {
  addListener: (eventName: string, handler: (event: GoogleMapMouseEvent) => void) => void;
  setCenter: (position: LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarker = {
  addListener: (eventName: string, handler: (event: GoogleMapMouseEvent) => void) => void;
  setPosition: (position: LatLngLiteral) => void;
};

type GoogleGeocoder = {
  geocode: (
    request: { location: LatLngLiteral },
    callback: (results: Array<{ formatted_address?: string }> | null, status: string) => void,
  ) => void;
};

type GoogleAutocomplete = {
  addListener: (eventName: string, handler: () => void) => void;
  getPlace: () => {
    name?: string;
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: () => number;
        lng: () => number;
      };
    };
  };
};

type GoogleMapMouseEvent = {
  latLng?: {
    lat: () => number;
    lng: () => number;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

type GoogleMapsLocationFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

const DEFAULT_CENTER = { lat: 16.0471, lng: 108.2068 };
const SCRIPT_ID = "google-maps-javascript-api";
let googleMapsPromise: Promise<GoogleMapsApi> | null = null;

const loadGoogleMaps = (apiKey: string) => {
  if (window.google?.maps) return Promise.resolve(window.google);

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          if (window.google?.maps) resolve(window.google);
          else reject(new Error("Google Maps failed to initialize"));
        });
        existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
        return;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error("Google Maps failed to initialize"));
      };
      script.onerror = () => reject(new Error("Google Maps failed to load"));
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
};

const formatCoordinates = (position: LatLngLiteral) => `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;

export function GoogleMapsLocationFilter({ value, onChange }: GoogleMapsLocationFilterProps) {
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const onChangeRef = useRef(onChange);
  const [isLoading, setIsLoading] = useState(Boolean(apiKey));
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!apiKey || !mapElementRef.current || !inputRef.current) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (!mounted || !mapElementRef.current || !inputRef.current) return;

        const map = new google.maps.Map(mapElementRef.current, {
          center: DEFAULT_CENTER,
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new google.maps.Marker({
          map,
          position: DEFAULT_CENTER,
          draggable: true,
        });
        const geocoder = new google.maps.Geocoder();

        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        const applyPosition = (position: LatLngLiteral, zoom = 14) => {
          marker.setPosition(position);
          map.setCenter(position);
          map.setZoom(zoom);
        };

        const reverseGeocode = (position: LatLngLiteral) => {
          applyPosition(position);
          geocoder.geocode({ location: position }, (results, status) => {
            const address = status === "OK" && results?.[0]?.formatted_address
              ? results[0].formatted_address
              : formatCoordinates(position);
            onChangeRef.current(address);
          });
        };

        map.addListener("click", (event) => {
          if (!event.latLng) return;
          reverseGeocode({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        marker.addListener("dragend", (event) => {
          if (!event.latLng) return;
          reverseGeocode({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        if (google.maps.places?.Autocomplete) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["formatted_address", "geometry", "name"],
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const location = place.geometry?.location;
            const address = place.formatted_address || place.name || "";

            if (address) onChangeRef.current(address);

            if (location) {
              applyPosition({ lat: location.lat(), lng: location.lng() });
            }
          });
        }

        setHasLoadError(false);
      })
      .catch(() => {
        if (mounted) setHasLoadError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [apiKey]);

  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="google-location-filter">{t("jobs.filters.locationMap.label")}</Label>
          <Input
            ref={inputRef}
            id="google-location-filter"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t("jobs.filters.locationMap.placeholder")}
            className="h-12 bg-white"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange("")}
          disabled={!value}
          className="w-full md:w-44"
        >
          <X className="h-4 w-4" />
          {t("jobs.filters.locationMap.clear")}
        </Button>
      </div>

      {!apiKey ? (
        <div className="rounded-md border border-dashed bg-white p-4 text-sm text-muted-foreground">
          {t("jobs.filters.locationMap.missingKey")}
        </div>
      ) : hasLoadError ? (
        <div className="rounded-md border border-destructive/30 bg-white p-4 text-sm text-destructive">
          {t("jobs.filters.locationMap.loadError")}
        </div>
      ) : (
        <div className="relative h-72 overflow-hidden rounded-md border bg-white">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          )}
          <div ref={mapElementRef} className="h-full w-full" />
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("jobs.filters.locationMap.hint")}</span>
      </div>
    </div>
  );
}
