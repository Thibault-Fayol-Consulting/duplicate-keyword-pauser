# Duplicate Keyword Pauser

> Google Ads Script for SMBs — Detect and pause duplicate keywords competing against each other

## What it does
Scans all enabled keywords across the entire account to find duplicates (same text + match type in different ad groups or campaigns). Pauses the weaker duplicate based on Quality Score, preventing internal competition and wasted spend.

## Setup
1. Open Google Ads > Tools > Scripts
2. Create a new script and paste the code from `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` block at the top:
   - `EMAIL`: your alert email
   - `TEST_MODE`: set to `false` when ready to pause duplicates
   - `KEEP_HIGHER_QS`: set to `false` to keep the first keyword found instead of comparing QS
4. Authorize and run a preview first
5. Schedule: **Weekly**

## CONFIG reference
| Parameter | Default | Description |
|-----------|---------|-------------|
| `TEST_MODE` | `true` | `true` = log only, `false` = pause duplicates + send email |
| `EMAIL` | `contact@domain.com` | Email address for duplicate alerts |
| `KEEP_HIGHER_QS` | `true` | Keep the keyword with higher Quality Score |
| `DEFAULT_QS` | `5` | Fallback QS when `getQualityScore()` returns null |

## How it works
1. Iterates all enabled keywords (with enabled campaigns and ad groups)
2. Builds a map keyed by `lowercase_text||matchType`
3. When a duplicate is found, compares Quality Scores (with null guard)
4. Pauses the keyword with the lower QS
5. Sends a summary email listing all paused duplicates

## Requirements
- Google Ads account (not MCC)
- Google Ads Scripts access

## License
MIT — Thibault Fayol Consulting
