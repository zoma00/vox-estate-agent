# Real Estate Fields and AI Agent Integration

This document describes the standard fields used for property listings in this project and how the AI agent ("PropEstateAI") helps to search, format, and enrich listing data.

## Standard Listing Fields
- `id` (string): Unique identifier for the listing.
- `title` (string): Short title for the listing, e.g., "3-bed apartment in downtown Athens".
- `description` (string): Full textual description of the property.
- `price` (number): Numeric price in the local currency.
- `currency` (string): Currency code (e.g., `EUR`, `USD`).
- `address` (string): Full address or general area description.
- `city` (string): City where the property is located.
- `bedrooms` (integer)
- `bathrooms` (integer)
- `area_sqm` (number): Size in square meters.
- `images` (array of strings): URLs to the listing images.
- `listing_url` (string): URL to the web listing page.
- `source` (string): Source of the listing (e.g., `PropEstateAI`, `ThirdPartySite`).
- `company` (string): Company name responsible for the listing (e.g., `PropEstateAI`).
- `timestamp` (ISO datetime): When the listing was added or updated.

## Website and Company Fields
- `company_name` (string): e.g., `PropEstateAI`.
- `company_website` (string): e.g., `https://propestateai.example.com`.
- `contact_email` (string)
- `phone` (string)

## AI Agent Role: Searching and Listing Facilitation
The AI agent acts as a helpful interface between the user and the listing database or external data sources. Typical responsibilities:

- Accept natural language queries ("Show me 2-bedroom apartments in Glyfada under €200k") and translate into structured search filters.
- Query internal database or proxy external listing providers and merge results.
- Summarize search results and create short listing highlights for quick preview.
- Generate or validate `description` content using LLM prompts, ensuring consistency and compliance with any required formats.
- Detect and extract URLs in text and mark them as `listing_url` or `source` fields.
- When generating audio responses for a listing, the system returns an `audio_url` (see Audio section below) which is saved with the message/listing record.

Example flow:
1. User: "Find 3-bedroom homes in Heraklion under 300k"
2. Agent: Parses intent → builds structured query `{ city: "Heraklion", bedrooms: 3, max_price: 300000 }`.
3. Agent: Queries DB/external APIs → returns top N matches.
4. Agent: Summarizes matches, returns structured listing objects plus a spoken/audio summary. Each spoken summary has an `audio_url` saved with the listing or chat message.

## Audio & TTS Integration
- When the backend generates audio for a bot response, it returns an `audio_url` (or `audioUrl`) which points to a file under the backend static server (e.g., `/static/audio/output_YYYYMMDD_HHMMSS_hash.wav`).
- Save this `audio_url` in the chat message object (e.g., `message.audioUrl`), or in the listing metadata for an official audio summary.
- The frontend `TTSService` should handle both `audioUrl` and `audio_url` keys to be resilient to naming differences.

Example chat message object:
```json
{
  "text": "Here are three homes that match your request...",
  "sender": "bot",
  "audio_url": "/static/audio/output_20250919_133000_abc123.wav",
  "timestamp": "2025-09-19T13:30:02.123Z"
}
```

## Storage & Indexing Recommendations
- Store listings and chat transcripts in a persistent DB (Postgres recommended).
- Index frequently queried fields: `city`, `price`, `bedrooms`, `timestamp`.
- Store `audio_path` or `audio_url` as a string column and optionally a small `audio_duration` numeric field.

## Privacy & Compliance
- When saving user-provided data or generated audio, ensure user consent where required.
- Sanitize any HTML in listing descriptions to prevent XSS when rendering in the frontend.

## Next steps / Enhancements
- Add expand-on-click for the inline ribbon to show full listing details and audio player.
- Add a per-listing playback history or cache to speed repeated playback.
- Add export features (CSV/JSON) for listing reports.

---
Generated: 2025-09-19
