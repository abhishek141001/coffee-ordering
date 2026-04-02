const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function geolocateIP(ip) {
  // Skip private/local IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }

  // Check cache
  const cached = cache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon,city,regionName`);
    const data = await response.json();

    if (data.status === 'success') {
      const result = {
        lat: data.lat,
        lng: data.lon,
        city: data.city,
        region: data.regionName,
      };
      cache.set(ip, { data: result, timestamp: Date.now() });
      return result;
    }
  } catch (error) {
    console.error('IP geolocation failed:', error.message);
  }

  return null;
}

export async function geocodeCity(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'CaffeineOperator/1.0' } }
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        city: data[0].display_name.split(',')[0],
        region: data[0].display_name.split(',').slice(1, 3).join(',').trim(),
      };
    }
  } catch (error) {
    console.error('Geocode failed:', error.message);
  }

  return null;
}
