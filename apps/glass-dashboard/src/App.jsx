import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BridgethingClient } from '@bridgething/client';

const client = new BridgethingClient();

function Icon({ name, size = 20 }) {
  const paths = {
    previous: <path d="M6 5v14M18.5 6.5 10 12l8.5 5.5z" />,
    next: <path d="M18 5v14M5.5 6.5 14 12l-8.5 5.5z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    play: <path d="m8 5 11 7-11 7z" />,
    search: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4 4" /></>,
    location: <><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2" /></>,
    high: <path d="M12 19V5m-6 6 6-6 6 6" />,
    low: <path d="M12 5v14m6-6-6 6-6-6" />,
    sunrise: <><path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 3v5M5.6 8.6l2.1 2.1m10.7-2.1-2.1 2.1" /></>,
    sunset: <><path d="M3 15h18M5 15a7 7 0 0 1 14 0M12 3v5M5.6 8.6l2.1 2.1m10.7-2.1-2.1 2.1M12 16v5m-3-3 3 3 3-3" /></>,
    humidity: <><path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z" /><path d="M9 16a3 3 0 0 0 3 3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function weatherIcon(code) {
  if (code === 0) return 'sun';
  if (code <= 2) return 'partly-cloudy';
  if (code === 3) return 'cloud';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloud';
}

function weatherDescription(code, isDay) {
  if (code === 0) return isDay ? 'Clear skies' : 'Clear night';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorms';
  return 'Current conditions';
}

function WeatherSymbol({ code, isDay }) {
  const symbol = !isDay && code === 0 ? 'night' : weatherIcon(code);
  return (
    <svg className={`weather-symbol weather-symbol-${symbol}`} viewBox="0 0 64 64" aria-hidden="true">
      {symbol === 'sun' && <><circle cx="32" cy="32" r="12" /><path d="M32 5v8m0 38v8M5 32h8m38 0h8M13 13l6 6m26 26 6 6m0-38-6 6m-26 26-6 6" /></>}
      {symbol === 'night' && <path d="M43 12a22 22 0 1 0 9 39 24 24 0 0 1-9-39Z" />}
      {symbol === 'partly-cloudy' && <><circle cx="23" cy="22" r="10" /><path d="M23 5v5m0 24v4M6 22h5m24 0h4m-28-12 4 4m16 16 4 4m0-24-4 4m-16 16-4 4" /><path d="M18 47h29a10 10 0 0 0 0-20 14 14 0 0 0-27-1 11 11 0 0 0-2 21Z" /></>}
      {symbol === 'cloud' && <path d="M16 48h32a11 11 0 0 0 0-22 15 15 0 0 0-29-2 12 12 0 0 0-3 24Z" />}
      {symbol === 'fog' && <><path d="M18 35h28a9 9 0 0 0 0-18 13 13 0 0 0-25-2 10 10 0 0 0-3 20Z" /><path d="M9 43h46M14 51h36" /></>}
      {symbol === 'rain' && <><path d="M16 39h32a11 11 0 0 0 0-22 15 15 0 0 0-29-2 12 12 0 0 0-3 24Z" /><path d="m22 46-3 7m16-7-3 7m16-7-3 7" /></>}
      {symbol === 'snow' && <><path d="M16 37h32a11 11 0 0 0 0-22 15 15 0 0 0-29-2 12 12 0 0 0-3 24Z" /><path d="M22 44v10m-4-7 8 4m0-8-8 4m20-3v10m-4-7 8 4m0-8-8 4" /></>}
      {symbol === 'storm' && <><path d="M16 37h32a11 11 0 0 0 0-22 15 15 0 0 0-29-2 12 12 0 0 0-3 24Z" /><path d="m35 40-9 12h8l-3 9 11-14h-8l4-7" /></>}
    </svg>
  );
}

function clockText(date, precision) {
  const hour = date.getHours();
  if (precision !== 'quarter-hour' && precision !== 'five-minute') {
    if (hour < 5) return 'deep night';
    if (hour < 8) return 'early morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  const interval = precision === 'quarter-hour' ? 15 : 5;

  let roundedHour = hour;
  let minute = Math.round(date.getMinutes() / interval) * interval;
  if (minute === 60) {
    roundedHour += 1;
    minute = 0;
  }
  const hour12 = roundedHour % 12 || 12;
  const nextHour = hour12 % 12 + 1;
  if (minute === 0) return `${hour12} o'clock`;
  if (minute === 15) return `quarter past ${hour12}`;
  if (minute === 30) return `half past ${hour12}`;
  if (minute === 45) return `quarter to ${nextHour}`;

  const words = {
    5: 'five',
    10: 'ten',
    20: 'twenty',
    25: 'twenty-five',
  };
  return minute < 30
    ? `${words[minute]} past ${hour12}`
    : `${words[60 - minute]} to ${nextHour}`;
}

function Clock({ face, fuzzyClockPrecision }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (face === 'analog') {
    const seconds = now.getSeconds() * 6;
    const minutes = now.getMinutes() * 6 + now.getSeconds() * 0.1;
    const hours = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
    return (
      <div className="analog-wrap">
        <svg className="analog" viewBox="0 0 220 220">
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="110" y1={i % 5 === 0 ? 11 : 17} x2="110" y2={i % 5 === 0 ? 25 : 22}
              transform={`rotate(${i * 6} 110 110)`} className={i % 5 === 0 ? 'tick major' : 'tick'} />
          ))}
          <line x1="110" y1="110" x2="110" y2="58" transform={`rotate(${hours} 110 110)`} className="hand hour" />
          <line x1="110" y1="110" x2="110" y2="38" transform={`rotate(${minutes} 110 110)`} className="hand minute" />
          <line x1="110" y1="126" x2="110" y2="28" transform={`rotate(${seconds} 110 110)`} className="hand second" />
          <circle cx="110" cy="110" r="5" className="pin" />
        </svg>
      </div>
    );
  }

  if (face === 'binary') {
    const values = [now.getHours(), now.getMinutes(), now.getSeconds()];
    return (
      <div className="binary-clock" aria-label={`${now.toLocaleTimeString()}`}>
        {values.map((value, column) => (
          <div className="binary-column" key={column}>
            {Array.from({ length: 4 }, (_, row) => {
              const tens = Math.floor(value / 10);
              const ones = value % 10;
              return (
                <React.Fragment key={row}>
                  <span className={(tens >> (3 - row)) & 1 ? 'on' : ''} />
                  <span className={(ones >> (3 - row)) & 1 ? 'on' : ''} />
                </React.Fragment>
              );
            })}
            <b>{String(value).padStart(2, '0')}</b>
          </div>
        ))}
      </div>
    );
  }

  if (face === 'pixel') {
    const digits = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
    const patterns = {
      '0': ['111','101','101','101','111'], '1': ['010','110','010','010','111'],
      '2': ['111','001','111','100','111'], '3': ['111','001','111','001','111'],
      '4': ['101','101','111','001','001'], '5': ['111','100','111','001','111'],
      '6': ['111','100','111','101','111'], '7': ['111','001','010','010','010'],
      '8': ['111','101','111','101','111'], '9': ['111','101','111','001','111'],
    };
    return (
      <div className="pixel-clock">
        {digits.split('').map((digit, i) => (
          <div className="pixel-digit" key={i}>{patterns[digit].flatMap((row, y) => row.split('').map((pixel, x) => <span key={`${y}-${x}`} className={pixel === '1' ? 'on' : ''} />))}</div>
        ))}
      </div>
    );
  }

  if (face === 'fuzzy') {
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return <div className="fuzzy-clock"><span>it is</span><strong>{clockText(now, fuzzyClockPrecision)}</strong><em>{time}</em></div>;
  }

  return (
    <div className="digital-clock">
      <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
      <span>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
    </div>
  );
}

async function netFetch(url, { method = 'GET', body = null, redirect = 'follow', allowBrowserFallback = true } = {}) {
  const headers = body === null ? [] : [{ name: 'Content-Type', value: 'application/json' }];
  const requestBody = body === null ? null : new TextEncoder().encode(JSON.stringify(body));
  let result;
  try {
    result = await client.net.fetch({
      request: { url, method, headers, body: requestBody, timeoutMs: 15000, redirect },
    });
  } catch (error) {
    if (!allowBrowserFallback) throw error;
  }
  if (result?.ok) {
    const { status, body } = result.response.response;
    if (status >= 200 && status < 300) {
      return JSON.parse(new TextDecoder().decode(body));
    }
    if (!allowBrowserFallback) throw new Error(`Request failed: ${status}`);
  }
  if (!allowBrowserFallback) throw new Error('Request was rejected by the host network service');
  const response = await fetch(url, {
    method,
    headers: Object.fromEntries(headers.map(({ name, value }) => [name, value])),
    body: requestBody ? new TextDecoder().decode(requestBody) : undefined,
    redirect,
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function parseSoundtrackZone(value) {
  const url = new URL(value);
  const path = url.pathname.split('/').filter(Boolean);
  if (url.protocol !== 'https:' || url.hostname !== 'display.soundtrackyourbrand.com' || url.username || url.password || path.length !== 1) {
    throw new Error('Use a Soundtrack display URL such as https://display.soundtrackyourbrand.com/BEEPLE.');
  }
  const zone = path[0].replace(/[^a-z0-9]/gi, '').toUpperCase();
  if (!zone) throw new Error('The Soundtrack display URL must include a zone name.');
  return zone;
}

const SOUNDTRACK_API_URL = 'https://api.soundtrackyourbrand.com/v2';
const SOUNDTRACK_QUERY = `
  query NowPlayingInitial($zone: ID!) {
    nowPlaying(soundZone: $zone) {
      track(market: US) {
        title
        artists {
          name
        }
        display {
          image {
            size(width: 300, height: 300)
          }
        }
      }
    }
  }
`;

function Weather({ unit, location, sharingEnabled, onSearch, showExtremesBeside }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!sharingEnabled) {
      setWeather(null);
      setLoading(false);
      setError('');
      return () => { cancelled = true; };
    }

    async function load() {
      setLoading(true);
      try {
        let place = null;
        if (location) {
          const found = await netFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
          place = found.results?.[0];
        }
        if (!place) throw new Error('Location not found');
        const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
        const data = await netFetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&temperature_unit=${tempUnit}`);
        if (!data.current) throw new Error('Weather forecast is unavailable');
        if (!cancelled) {
          setWeather({ ...data, placeName: place.name || place.admin1 || location });
          setError('');
        }
      } catch (error) {
        if (!cancelled) {
          setWeather(null);
          setError(error instanceof Error ? error.message : 'Weather is unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const timer = window.setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [location, sharingEnabled, unit]);

  const temperature = weather?.current?.temperature_2m;
  const code = weather?.current?.weather_code;
  const temperatureSymbol = unit === 'fahrenheit' ? '°F' : '°C';
  const isDay = weather?.current?.is_day !== 0;
  const today = weather?.daily;
  const placeName = weather?.placeName || location.split(',')[0];
  const condition = weather
    ? weatherDescription(code, isDay)
    : loading
      ? 'Updating forecast'
      : sharingEnabled
        ? error || 'Weather unavailable'
        : 'Weather sharing is off';
  const temperatureValue = temperature != null ? `${Math.round(temperature)}°` : '--°';
  const formatLocalTime = (value) => value?.split('T')[1]?.slice(0, 5) || '--:--';
  const highLowStats = showExtremesBeside ? <>
    <div className="weather-stat weather-extreme">
      <span>High:</span>
      <strong>{today?.temperature_2m_max?.[0] != null ? `${Math.round(today.temperature_2m_max[0])}°` : '--°'}</strong>
    </div>
    <div className="weather-stat weather-extreme">
      <span>Low:</span>
      <strong>{today?.temperature_2m_min?.[0] != null ? `${Math.round(today.temperature_2m_min[0])}°` : '--°'}</strong>
    </div>
  </> : <>
    <div className="weather-stat">
      <Icon name="high" size={15} />
      <div><span>HIGH</span><strong>{today?.temperature_2m_max?.[0] != null ? `${Math.round(today.temperature_2m_max[0])}°` : '--°'}</strong></div>
    </div>
    <div className="weather-stat">
      <Icon name="low" size={15} />
      <div><span>LOW</span><strong>{today?.temperature_2m_min?.[0] != null ? `${Math.round(today.temperature_2m_min[0])}°` : '--°'}</strong></div>
    </div>
  </>;
  return (
    <button className="weather glass" data-extremes={showExtremesBeside ? 'beside' : 'stacked'} onClick={onSearch} type="button" aria-label={`Weather in ${placeName}. ${condition}. ${temperatureValue}${temperatureSymbol}. Change location.`}>
      <div className="weather-heading">
        <span className="weather-place"><Icon name="location" size={14} />{placeName}</span>
        <span className="weather-live"><i />NOW</span>
      </div>
      <div className="weather-current">
        <div className="weather-symbol-wrap"><WeatherSymbol code={code} isDay={isDay} /></div>
        <div className="weather-temperature">
          <strong>{temperatureValue}</strong>
          <span className="weather-unit">{temperatureSymbol.replace('°', '')}</span>
          <span className="weather-description">{condition}</span>
        </div>
        {showExtremesBeside && <div className="weather-extremes">{highLowStats}</div>}
      </div>
      <div className="weather-stats">
        {!showExtremesBeside && highLowStats}
        <div className="weather-stat">
          <Icon name="sunrise" size={15} />
          <div><span>SUNRISE</span><strong>{formatLocalTime(today?.sunrise?.[0])}</strong></div>
        </div>
        <div className="weather-stat">
          <Icon name="sunset" size={15} />
          <div><span>SUNSET</span><strong>{formatLocalTime(today?.sunset?.[0])}</strong></div>
        </div>
      </div>
      <div className="weather-footer">
        <span><Icon name="humidity" size={14} />{weather?.current?.relative_humidity_2m ?? '--'}% humidity</span>
        <span>{weather ? 'Tap to change city' : sharingEnabled ? 'Tap to retry' : 'Enable sharing in settings'}</span>
      </div>
    </button>
  );
}

function LocationSearch({ location, sharingEnabled, onClose, onSelect }) {
  const [query, setQuery] = useState(location);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  useEffect(() => { setQuery(location); }, [location]);

  useEffect(() => {
    const term = query.trim();
    if (!sharingEnabled || term.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }

    let cancelled = false;
    setResults([]);
    setSearching(false);
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const data = await netFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=6&language=en&format=json`);
        if (!cancelled) setResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!cancelled) {
          setResults([]);
          setSearchError(error instanceof Error ? error.message : 'Location search failed');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, sharingEnabled]);

  return (
    <div className="search-backdrop" role="dialog" aria-modal="true" aria-label="Choose weather location">
      <div className="location-search glass">
        <form onSubmit={(event) => event.preventDefault()}>
          <Icon name="search" size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a city name" disabled={!sharingEnabled} />
          <span className="search-status" aria-live="polite">{searching ? 'Searching…' : ''}</span>
        </form>
        <p className="search-disclosure">
          {sharingEnabled
            ? 'City searches and forecast coordinates are sent to Open-Meteo.'
            : 'Enable weather data sharing in settings before searching. No location is sent while it is off.'}
        </p>
        <div className="search-results">
          {results.map((place) => (
            <button type="button" key={`${place.id}-${place.latitude}`} onClick={() => onSelect(place)}>
              <span>{place.name}</span><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small>
            </button>
          ))}
          {searchError && <p role="status">{searchError}</p>}
          {!results.length && !searching && !searchError && sharingEnabled && <p>{query.trim().length >= 2 ? 'No matching locations found.' : 'Type at least two characters to search.'}</p>}
        </div>
        <button type="button" className="close-search" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function Player({ state, onAction, sourceLabel }) {
  const track = state?.track;
  const playback = state?.playback;
  const [artUrl, setArtUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';
    async function loadArt() {
      setArtUrl('');
      if (track?.artworkUrl) {
        setArtUrl(track.artworkUrl);
        return;
      }
      if (!track?.artworkId) return;
      const result = await client.asset.get({ id: track.artworkId, requestId: crypto.randomUUID() }).catch(() => null);
      if (!cancelled && result?.ok && result.response?.bytes) {
        const blob = new Blob([result.response.bytes], { type: result.response.mime || 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setArtUrl(objectUrl);
      }
    }
    loadArt();
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [track?.artworkId]);

  const playing = playback?.state === 'playing';
  const position = (playback?.positionMs || 0) / 1000;
  const duration = (track?.durationMs || 0) / 1000;
  const progress = duration ? Math.min(100, position / duration * 100) : 0;

  return (
    <div className="player glass">
      <div className="album" style={artUrl ? { backgroundImage: `url(${artUrl})` } : undefined}>{!artUrl && <span>♪</span>}</div>
      <div className="track">
        <div className="track-copy">
          <strong>{track?.title || (sourceLabel ? `${sourceLabel} monitor` : 'Nothing playing')}</strong>
          <span>{track?.artist || (sourceLabel ? 'Waiting for status update' : 'Waiting for music')}</span>
        </div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="controls">
        <button type="button" onClick={() => onAction('previous')} aria-label="Previous"><Icon name="previous" size={19} /></button>
        <button type="button" className="play-button" onClick={() => onAction(playing ? 'pause' : 'play')} aria-label={playing ? 'Pause' : 'Play'}>
          <Icon name={playing ? 'pause' : 'play'} size={21} />
        </button>
        <button type="button" onClick={() => onAction('next')} aria-label="Next"><Icon name="next" size={19} /></button>
      </div>
    </div>
  );
}

function SoundtrackCard({ track }) {
  const [coverUrl, setCoverUrl] = useState('');
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setCoverUrl('');
    setCoverError(false);

    async function loadCover() {
      if (!track?.artworkUrl) return;
      const url = new URL(track.artworkUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'i.soundcdn.com' || url.username || url.password) {
        throw new Error('Unexpected Soundtrack artwork URL.');
      }

      const result = await client.net.fetch({
        request: {
          url: url.href,
          method: 'GET',
          headers: [],
          body: null,
          timeoutMs: 15000,
          redirect: 'error',
        },
      });
      if (!result.ok) throw new Error('The host network service rejected the artwork request.');

      const response = result.response.response;
      const contentType = response.headers
        .find(({ name }) => name.toLowerCase() === 'content-type')
        ?.value;
      if (response.status < 200 || response.status >= 300 || !contentType?.startsWith('image/')) {
        throw new Error(`Unexpected artwork response: ${response.status} ${contentType || 'unknown content type'}.`);
      }

      objectUrl = URL.createObjectURL(new Blob([response.body], { type: contentType }));
      if (active) setCoverUrl(objectUrl);
    }

    loadCover().catch((error) => {
      if (active) {
        setCoverError(true);
        console.error('Soundtrack cover art unavailable:', error);
      }
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track?.artworkUrl]);

  return (
    <div className="soundtrack-card glass">
      <div className="soundtrack-cover" style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : undefined} aria-hidden="true">
        {!coverUrl && <span>♫</span>}
      </div>
      <div className="soundtrack-track">
        <div className="track-copy">
          <strong>{track?.title || 'Soundtrack'}</strong>
          <span>{track?.artist || 'Waiting for status update'}</span>
        </div>
        {coverError && <span className="soundtrack-cover-error">Cover art unavailable</span>}
      </div>
      <span className="soundtrack-label">NOW PLAYING</span>
    </div>
  );
}

export default function App() {
  const [clockFace, setClockFace] = useState('digital');
  const [fuzzyClockPrecision, setFuzzyClockPrecision] = useState('daypart');
  const [backgroundTheme, setBackgroundTheme] = useState('midnight');
  const [unit, setUnit] = useState('celsius');
  const [location, setLocation] = useState('Amsterdam');
  const [dashboardLayout, setDashboardLayout] = useState('balanced');
  const [widgetSpacing, setWidgetSpacing] = useState('balanced');
  const [clockSize, setClockSize] = useState('balanced');
  const [weatherSize, setWeatherSize] = useState('balanced');
  const [playerSize, setPlayerSize] = useState('balanced');
  const [showClock, setShowClock] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showPlayback, setShowPlayback] = useState(true);
  const [showSoundtrack, setShowSoundtrack] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [weatherSharingEnabled, setWeatherSharingEnabled] = useState(false);
  const [alwaysPlayer, setAlwaysPlayer] = useState(false);
  const [playerState, setPlayerState] = useState(null);
  const [soundtrackEnabled, setSoundtrackEnabled] = useState(false);
  const [soundtrackUrl, setSoundtrackUrl] = useState('https://display.soundtrackyourbrand.com/BEEPLE');
  const [soundtrackTrack, setSoundtrackTrack] = useState(null);
  const [soundtrackError, setSoundtrackError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = client.player.onSnapshot((reply) => setPlayerState(reply.state));
    client.player.stateGet().then((reply) => { if (reply.ok) setPlayerState(reply.response.state); });

    async function readConfig() {
      const reply = await client.config.list();
      if (!reply.ok) return;
      const entries = Object.fromEntries(reply.response.entries.map(({ key, value }) => [key, value]));
      if (entries.clockFace) setClockFace(entries.clockFace);
      if (entries.fuzzyClockPrecision) setFuzzyClockPrecision(entries.fuzzyClockPrecision);
      if (entries.backgroundTheme) setBackgroundTheme(entries.backgroundTheme);
      if (entries.temperatureUnit) setUnit(entries.temperatureUnit);
      if (entries.weatherLocation) setLocation(entries.weatherLocation);
      if (entries.dashboardLayout) setDashboardLayout(entries.dashboardLayout);
      if (entries.widgetSpacing) setWidgetSpacing(entries.widgetSpacing);
      if (entries.clockSize) setClockSize(entries.clockSize);
      if (entries.weatherSize) setWeatherSize(entries.weatherSize);
      if (entries.playerSize) setPlayerSize(entries.playerSize);
      if (Object.hasOwn(entries, 'showClock')) setShowClock(entries.showClock === 'true' || entries.showClock === true);
      if (Object.hasOwn(entries, 'showWeather')) setShowWeather(entries.showWeather === 'true' || entries.showWeather === true);
      if (Object.hasOwn(entries, 'showPlayback')) setShowPlayback(entries.showPlayback === 'true' || entries.showPlayback === true);
      if (Object.hasOwn(entries, 'showSoundtrack')) setShowSoundtrack(entries.showSoundtrack === 'true' || entries.showSoundtrack === true);
      if (Object.hasOwn(entries, 'lowPowerMode')) setLowPowerMode(entries.lowPowerMode === 'true' || entries.lowPowerMode === true);
      if (Object.hasOwn(entries, 'weatherSharingEnabled')) setWeatherSharingEnabled(entries.weatherSharingEnabled === 'true' || entries.weatherSharingEnabled === true);
      if (entries.alwaysShowPlayback) setAlwaysPlayer(entries.alwaysShowPlayback === 'true');
      if (entries.soundtrackEnabled) setSoundtrackEnabled(entries.soundtrackEnabled === 'true');
      if (Object.hasOwn(entries, 'soundtrackUrl')) setSoundtrackUrl(entries.soundtrackUrl);
    }
    readConfig();
    const offConfig = client.config.onChanged(({ key, value }) => {
      if (key === 'clockFace') setClockFace(value || 'digital');
      if (key === 'fuzzyClockPrecision') setFuzzyClockPrecision(value || 'daypart');
      if (key === 'backgroundTheme') setBackgroundTheme(value || 'midnight');
      if (key === 'temperatureUnit') setUnit(value || 'celsius');
      if (key === 'weatherLocation') setLocation(value || 'Amsterdam');
      if (key === 'dashboardLayout') setDashboardLayout(value || 'balanced');
      if (key === 'widgetSpacing') setWidgetSpacing(value || 'balanced');
      if (key === 'clockSize') setClockSize(value || 'balanced');
      if (key === 'weatherSize') setWeatherSize(value || 'balanced');
      if (key === 'playerSize') setPlayerSize(value || 'balanced');
      if (key === 'showClock') setShowClock(value === 'true' || value === true);
      if (key === 'showWeather') setShowWeather(value === 'true' || value === true);
      if (key === 'showPlayback') setShowPlayback(value === 'true' || value === true);
      if (key === 'showSoundtrack') setShowSoundtrack(value === 'true' || value === true);
      if (key === 'lowPowerMode') setLowPowerMode(value === 'true' || value === true);
      if (key === 'weatherSharingEnabled') setWeatherSharingEnabled(value === 'true' || value === true);
      if (key === 'alwaysShowPlayback') setAlwaysPlayer(value === 'true');
      if (key === 'soundtrackEnabled') setSoundtrackEnabled(value === 'true');
      if (key === 'soundtrackUrl') setSoundtrackUrl(value || '');
    });
    return () => { unsubscribe(); offConfig(); };
  }, []);

  useEffect(() => {
    if (!soundtrackEnabled || !soundtrackUrl.trim()) {
      setSoundtrackTrack(null);
      setSoundtrackError('');
      return;
    }
    let zone;
    try {
      zone = parseSoundtrackZone(soundtrackUrl.trim());
    } catch (error) {
      setSoundtrackTrack(null);
      setSoundtrackError(error.message);
      return;
    }

    let cancelled = false;
    let timer;
    async function poll() {
      try {
        const data = await netFetch(SOUNDTRACK_API_URL, {
          method: 'POST',
          body: { query: SOUNDTRACK_QUERY, variables: { zone } },
          redirect: 'error',
        });
        if (cancelled) return;
        if (Array.isArray(data.errors) && data.errors.length) {
          throw new Error(data.errors.map(({ message }) => message).filter(Boolean).join('; ') || 'Soundtrack returned a GraphQL error.');
        }
        const track = data?.data?.nowPlaying?.track;
        if (track?.title || track?.artists?.length) {
          setSoundtrackTrack({
            title: track.title || 'Unknown track',
            artist: track.artists?.map(({ name }) => name).filter(Boolean).join(', ') || 'Unknown artist',
            artworkUrl: track.display?.image?.size || '',
          });
        } else {
          setSoundtrackTrack(null);
        }
        setSoundtrackError('');
      } catch (error) {
        if (!cancelled) {
          setSoundtrackTrack(null);
          setSoundtrackError(`Soundtrack status unavailable: ${error instanceof Error ? error.message : String(error)}`);
        }
      } finally {
        if (!cancelled) timer = window.setTimeout(poll, 5000);
      }
    }
    poll();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [soundtrackEnabled, soundtrackUrl]);

  async function playbackAction(action) {
    if (action === 'pause') await client.player.pause();
    else if (action === 'play') await client.player.resume();
    else if (action === 'previous') await client.player.skipPrev({ allowSeeking: true });
    else if (action === 'next') await client.player.skipNext();
  }

  const soundtrackConfigured = soundtrackEnabled && Boolean(soundtrackUrl.trim());
  const showPlayer = showPlayback && (alwaysPlayer || playerState?.playback?.state === 'playing');
  const showSoundtrackCard = showSoundtrack && soundtrackConfigured;
  const mediaCount = Number(showPlayer) + Number(showSoundtrackCard);

  return (
    <main className="dashboard" data-layout={dashboardLayout} data-spacing={widgetSpacing} data-performance={lowPowerMode ? 'low' : 'full'} data-theme={backgroundTheme}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {showClock && <section className="clock-panel glass" data-size={clockSize}><Clock face={clockFace} fuzzyClockPrecision={fuzzyClockPrecision} /></section>}
      {showWeather && <aside className="side-column" data-size={weatherSize}>
        <Weather
          unit={unit}
          location={location}
          sharingEnabled={weatherSharingEnabled}
          showExtremesBeside={weatherSize === 'large' || dashboardLayout === 'weather-focus'}
          onSearch={() => setSearchOpen(true)}
        />
      </aside>}
      {mediaCount > 0 && <section className="media-row" data-count={mediaCount}>
        {showPlayer && <div className="player-slot" data-size={playerSize}><Player state={playerState} onAction={playbackAction} sourceLabel="" /></div>}
        {showSoundtrackCard && <div className="soundtrack-slot"><SoundtrackCard track={soundtrackTrack} /></div>}
      </section>}
      {soundtrackError && <p className="dashboard-message" role="status">{soundtrackError}</p>}
      {searchOpen && <LocationSearch location={location} sharingEnabled={weatherSharingEnabled} onClose={() => setSearchOpen(false)} onSelect={(place) => {
        setLocation([place.name, place.admin1, place.country].filter(Boolean).join(', '));
        setSearchOpen(false);
      }} />}
    </main>
  );
}
