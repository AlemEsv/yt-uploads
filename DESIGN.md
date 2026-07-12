# Design Documentation — Musicplayer Desktop App

## Overview

A dark-themed desktop music player dashboard (approx. 1520 × 1110px canvas). The interface is inspired by Spotify's layout: a fixed left sidebar for navigation, a large main content area, and a persistent playback bar at the bottom. The palette is near-black with vivid colored accents for genre tags.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#000000` | Page background |
| Surface | `#080808` | Cards, sidebar panels, search bar, player bar |
| Primary text | `#FFFFFF` | Headings, nav labels, track titles |
| Secondary text | `#B2B2B2` / `#B3B3B3` | Artist names, subtitles |
| Muted text | `#9B9B9B` | Playlist items |
| Inactive text | `#D7D7D7` | Album subtitles under recently played |
| Search placeholder | `#696969` | Italic placeholder in search input |
| Search bar fill | `#F1F1F1` | Search input background |
| Play Now button | `#F1F1F1` | CTA button on hero banner |
| Play Now text | `#000000` | Text on Play Now button |
| Progress bar (active) | `#0C1B6A` | Playback scrubber fill |
| Progress bar (inactive) | `#414141` | Volume/progress track |
| Genre: Dance/Electronic | `#C30DD2` | Purple-magenta |
| Genre: Rock | `#C71B1B` | Red |
| Genre: Pop | `#7D25ED` | Violet |
| Genre: Korean-pop | `#207C29` | Green |
| Genre: Made For You | `#121F4A` | Dark navy |
| Genre: Others | `#35827D` | Teal |
| Heart / like icon | `#F21C2C` | Red heart |
| Battery indicator | `#ED0000` | Red battery fill |

---

## Typography

**Font families:** Poppins (primary), Roboto (secondary for time labels)

| Role | Family | Weight | Size |
|---|---|---|---|
| App name "Musicplayer" | Poppins | Bold | 18px |
| Hero label "New Release!" | Poppins | Bold | 27px |
| Hero title (album/artist) | Poppins | Medium | 64px |
| Section headings ("Recently played", etc.) | Poppins | SemiBold | 25px |
| Subsection headings ("Top Global", etc.) | Poppins | Bold | 20px |
| Nav section labels ("DISCOVER", "LIBRARY") | Poppins | SemiBold | 14px |
| Nav items (Home, Genres, Albums…) | Poppins | SemiBold | 14px |
| Track/album titles in lists | Poppins | SemiBold | 14px |
| Artist names in lists | Poppins | Medium | 13px |
| Recently played album titles | Poppins | Bold | 18px |
| Recently played artist names | Poppins | SemiBold | 16px |
| Playlist items | Poppins | Medium | 14px |
| Now playing track name | Poppins | Medium | 15px |
| Now playing artist | Poppins | Regular | 12px |
| Track duration labels | Roboto | Medium | 12px |
| Search placeholder | Poppins | Italic | 12px |
| Genre tag labels | Poppins | Bold | 14px |
| User name ("Captain Marvel") | Poppins | SemiBold | 14px |
| Ranked list numbers (1, 2, 3) | Poppins | Bold | 18px |

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar: logo · search · user avatar                            │
├──────────────┬───────────────────────────────────────────────────┤
│              │  Hero Banner (new release + artist photo)         │
│  Left        ├───────────────────────────────────────────────────┤
│  Sidebar     │  Recently Played (horizontal album card row)      │
│  (nav)       ├───────────────────────────────────────────────────┤
│              │  3-column grid:                                   │
│              │  Your Top Genres | Top Global | Popular Podcast   │
├──────────────┴───────────────────────────────────────────────────┤
│  Player Bar (now playing · scrubber · transport controls)        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Regions

### Top Bar
- Full-width, sits at the very top of the canvas.
- Left: music note icon + "Musicplayer" wordmark (white, Poppins Bold 18px).
- Center: search input (white rounded rectangle, `#F1F1F1` fill, 605px wide, 34px tall, radius 6px). Contains a search icon and italic gray placeholder "Artists, songs, or podcasts".
- Right: dark pill (`#080808`, 200px wide, radius 6px) housing a circular avatar (26px) + "Captain Marvel" label + dropdown chevron.

### Left Sidebar
- Dark card (`#080808`), 254px wide, 629px tall, radius 15px, top offset 43px.
- Sections stacked vertically:
  - **DISCOVER** (section label) → Home, Genres, Albums, Events (with icons: home, genres glyph, music note, calendar)
  - **LIBRARY** (section label) → Recent (heart icon), Liked songs, Local
  - **YOUR PLAYLIST** (section label) → Create playlist, Morning mood 2021, Study musics
- All items left-padded ~22px from sidebar edge; section labels at 0px padding (flush with 120px left offset from canvas).

### Hero Banner
- Spans the full main area width (~1153px wide, 348px tall).
- Background: a large artist/band photo (desaturated, full-bleed, slightly overflowing the container vertically).
- Text overlay (white, left-aligned):
  - "New Release!" — Poppins Bold 27px
  - Album title "Light Downs Low" + artist "MAX" — Poppins Medium 64px, two lines
  - "Play Now!" CTA button — light gray (`#F1F1F1`) pill, 90px × 27px, radius 5px, drop shadow. Black text inside, Poppins Medium 14px. Positioned inline after the artist name.
- Artist silhouette photo bleeds to the right, partially clipped.

### Recently Played
- Section heading "Recently played" — Poppins SemiBold 25px, white.
- Horizontal row of 6 album cards, each 165 × 165px, radius 9px, gap ~197px between left edges.
- Below each card: album title (Poppins Bold 18px white) + artist name (Poppins SemiBold 16px, `#D7D7D7`).
- Albums: I (TAEYEON), Map of The Soul: 7 (BTS), Let's chill (alex), Stand Out Fit In (ONE OK ROCK), Top Hits of 80s (Musicplay), Flying Without W.. (Westlife).

### Three-Column Content Grid (below Recently Played)

#### Your Top Genres (leftmost, 254px wide dark card)
- Heading: "Your Top Genres" — Poppins Bold 20px white.
- 2×3 grid of colored genre chips (rounded rectangle, 60px tall, radius 10px):
  - Row 1: Dance/Electronic (`#C30DD2`, 121px) · Rock (`#C71B1B`, 88px)
  - Row 2: Pop (`#7D25ED`, 75px) · Korean-pop (`#207C29`, 133px)
  - Row 3: Made For You (`#121F4A`, 121px) · Others.. (`#35827D`, 88px)
- Labels: Poppins Bold 14px white, positioned within chips.

#### Top Global (center, 562px wide dark card)
- Heading: "Top Global" — Poppins Bold 20px white.
- Numbered list (1–3) of tracks. Each row:
  - Rank number (Poppins Bold 18px white, ~30px wide)
  - Album art thumbnail (64 × 64px, radius 3px)
  - Track title (Poppins SemiBold 14px white) + artist (Poppins Medium 13px, `#B2B2B2`)
  - Right-aligned: three-dot menu · heart icon · duration label (Roboto Medium 12px white) · play icon
- Tracks: 1. Permission to Dance – BTS · 2. STAY – The KID LAROI, Justin Bieber · 3. Bad Habits – Ed Sheeran

#### Popular Podcast (rightmost, 562px wide dark card)
- Heading: "Popular Podcast" — Poppins Bold 20px white.
- Same numbered-list layout as Top Global.
- Podcasts: 1. CONFIDENCE – Daily Motivations · 2. Tips Jualan di Internet – Raditya Dika · 3. Mendapatkan Ide Copy... – Afik Canggih

### Player Bar
- Full-width dark bar (`#080808`), 65px tall, radius 15px, pinned to bottom (offset 1008px).
- **Left**: album art thumbnail (45 × 45px, radius 6px) + "A Sky Full of Stars" / "Coldplay" text + red heart icon.
- **Center**: playback transport controls (skip back, previous, play/pause, next, skip forward). Below controls: a horizontal progress/scrubber line.
- **Right**: volume and other playback icons (shuffle, repeat, queue, volume slider area). A short gray `#414141` progress track (101px) sits above this area.
- Top edge of bar has a blue accent line (`#0C1B6A`, 4px stroke, 893px wide) separating it from content above.

---

## Spacing & Sizing

- Canvas: ~1520px wide × 1110px tall (absolute-positioned layout)
- Sidebar width: 254px
- Main content left offset: 365px (sidebar + gap)
- Album card size: 165 × 165px
- List item thumbnail: 64 × 64px
- Player bar height: 65px
- Search bar height: 34px
- Genre chip height: 60px
- Border radii: 6px (inputs), 9px (album cards), 10px (genre chips), 15px (large panels)
- Top system bar (battery/wifi icons): ~18px tall, positioned at far top-right

---

## Iconography

All icons are rendered as inline SVG paths. Identified icons:
- Search (magnifying glass, `#696969` stroke)
- Music note / Musicplayer logo mark (white fill)
- Home glyph (white fill)
- Album/grid glyph (white fill)
- Calendar event (`bi:calendar-event`, white fill)
- Heart / like (red `#F21C2C` fill)
- Play (triangle, white fill)
- Three-dot menu (horizontal, white fill)
- Playback transport: skip, previous, play/pause, next, forward arrows
- Shuffle / repeat icons (white)
- Volume icon (white)
- Battery / signal indicators (top-right system chrome)
- Dropdown chevron (white)

---

## Interactive Affordances

| Element | State/Behavior |
|---|---|
| Nav items | Clickable, active item indicated by icon + text |
| Search input | Focused input with placeholder text |
| Album cards | Clickable (implied hover) |
| Genre chips | Clickable filter toggles |
| Track list rows | Hover → reveal play controls |
| Three-dot menu | Opens context menu |
| Heart icon | Toggles liked state (filled red = liked) |
| Play Now button | Triggers album playback |
| Player transport | Standard media controls |
| Progress scrubber | Draggable seek bar |
| User dropdown | Opens profile/settings menu |
