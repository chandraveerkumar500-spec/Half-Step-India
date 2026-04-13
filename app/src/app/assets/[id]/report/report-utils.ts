export const UNKNOWN_DISTANCE = Number.MAX_SAFE_INTEGER;

export type NearbyAsset = {
  id: string;
  latitude: number;
  longitude: number;
};

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((radiusKm * c).toFixed(2));
}

export function distanceToAsset(
  asset: NearbyAsset,
  coords: { lat: number; lng: number }
) {
  if (!asset.latitude || !asset.longitude) return UNKNOWN_DISTANCE;
  return calculateDistance(coords.lat, coords.lng, asset.latitude, asset.longitude);
}
