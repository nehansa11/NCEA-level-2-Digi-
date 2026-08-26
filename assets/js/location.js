export function getBrowserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("UNSUPPORTED"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        const code =
          error.code === error.PERMISSION_DENIED ? "DENIED" :
          error.code === error.POSITION_UNAVAILABLE ? "UNAVAILABLE" :
          error.code === error.TIMEOUT ? "TIMEOUT" : "UNKNOWN";
        reject(new Error(code));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
        ...options
      }
    );
  });
}
export function distanceKm(pointA, pointB) {
  if (!pointA || !pointB) return NaN;
  const lat1 = Number(pointA.lat);
  const lng1 = Number(pointA.lng);
  const lat2 = Number(pointB.lat);
  const lng2 = Number(pointB.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return NaN;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function attachDistances(services, userLocation) {
  return services.map((service) => ({
    ...service,
    distanceKm: distanceKm(userLocation, { lat: service.lat, lng: service.lng })
  }));
}

export function sortByDistance(services) {
  return [...services].sort((a, b) => {
    const aDistance = Number.isFinite(a.distanceKm) ? a.distanceKm : Number.POSITIVE_INFINITY;
    const bDistance = Number.isFinite(b.distanceKm) ? b.distanceKm : Number.POSITIVE_INFINITY;
    if (aDistance !== bDistance) return aDistance - bDistance;
    return String(a["Organisation Name"] || "").localeCompare(String(b["Organisation Name"] || ""), "en-NZ");
  });
}
