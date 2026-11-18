// Cloudflare Web Analytics: cookie-free page views, so the site needs no consent banner.
// https://developers.cloudflare.com/web-analytics/

const beaconSrc = 'https://static.cloudflareinsights.com/beacon.min.js'

export type Beacon = { src: string; cfBeacon: string }

// Every host serves the same prerendered HTML, so the browser decides whether
// to count the page. Only the production host loads the beacon. PR previews
// and local servers don't. The beacon tracks client-side route changes on its
// own, so loading it once per page load is enough.
export function webAnalyticsBeacon(
  hostname: string,
  { token, productionHost }: { token: string; productionHost: string },
): Beacon | undefined {
  if (!token || hostname !== productionHost) return undefined
  return { src: beaconSrc, cfBeacon: JSON.stringify({ token }) }
}

export function loadBeacon({ src, cfBeacon }: Beacon) {
  if (document.querySelector(`script[src="${src}"]`)) return
  const script = document.createElement('script')
  // Cloudflare's manual setup loads the beacon as a module.
  script.type = 'module'
  script.src = src
  script.dataset.cfBeacon = cfBeacon
  document.body.append(script)
}
