# FinalsCalc functionality audit

## How it works

FinalsCalc is a static Next.js app. The browser stores classes and preferences locally and computes projected grades using the current grade and final exam weight. The optional Canvas Pages Function fetches course names and enrollment scores; it is separate from the calculator. Share links transfer a snapshot to another browser. JSON is the full backup format, while CSV and visual exports are reports.

## Improvements

- The calculator, charts and What-If now use the same final grade policy. A 92.50% current grade and a 20%-weight final need 92.50% for an A with whole-grade rounding, or 95.00% without it. Current grades are not rounded. Requirements above 100% stay marked unreachable.
- Canvas Sync now explains the proxy and optional local token storage. Proxy requests are no-store, bounded, and only go to standard Canvas school domains or configured institutions. Course pagination stays with the selected institution. A repeat import preserves edited class settings and keeps courses missing from a partial response until the user removes them.
- Static share pages read data in the browser, including legacy query-based links. New URLs use the fragment and omit assignment and Canvas metadata. Import adds copies; applying shared settings is optional. JSON restores validate before writing and require confirmation to replace classes.
- CSV protects quoted names and empty lists; PDF exports split long views across pages. PDF and PNG now have a capture target and describe what they export.
- The build checks TypeScript, does not download fonts or load external scripts, and ships its install icons. Cloudflare Pages serves static routes directly rather than rewriting all requests to the landing page.

## Verification and remaining checks

Run `npm test`, `npm run typecheck`, and `npm run build`. Tests use fictional Canvas responses, never an account token. Before merging, verify the Cloudflare preview, use synthetic grades to confirm desktop and mobile sharing and visual exports, and verify any configured Canvas custom domain. No access to live Canvas or student data is needed for the synthetic checks.

The first Cloudflare preview was manually checked with fictional data: direct calculator routing, rounding on and off, What-If, new and legacy share links, additive import after refresh, and a PDF download. Recheck visual export downloads and canceled backup restores on the final preview before merging.
