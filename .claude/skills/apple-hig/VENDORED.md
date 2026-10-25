# Vendored: apple-hig

- Upstream: https://github.com/ebuntario/apple-hig (MIT, see `LICENSE`)
- Version: see `VERSION` (upstream commit `c434b91`, 2026-04-21)
- Copied: `SKILL.md`, `references/`, `README.md`, `CHANGELOG.md`, `LICENSE`, `VERSION`.
  Not copied: `bin/`, `setup` (installer scripts), `assets/`. Do not edit files here.
- Installed at the owner's request ("install the Apple skill and use that knowledge").

## How this project uses it
- **Target: iPhone, as a home-screen web app (PWA).** The owner's device is an iPhone, so "Phase 0" targeting is answered.
- Use the platform-neutral rules (touch targets ≥ 44pt, sheets, tab bars, safe areas, Dynamic Type intent, Reduce Motion, VoiceOver labels) and translate SwiftUI specifics to their web equivalents.
- The glass & glow look (owner's choice, concept A) stays. HIG informs the controls and behavior, not the visual identity.
