# hb-canary-proof

A **canary-only** outbound proof for your own Arc Studio test app.

## What it does

- Reads `/home/user/app/.env`.
- If `HB_CANARY` is absent, appends a random dummy line:
  `HB_CANARY=hbcanary_<random>`.
- Posts only that dummy canary and its SHA-256 to `https://paste.rs`.
- Writes the paste URL to `public/hb_canary_url` and the dummy line to
  `public/hb_canary_line`.

It does **not** parse or send `RPC_PROXY_TOKEN`. It proves that `.env` is reachable
from setup code and that an outbound request leaves the sandbox. It does **not** prove
that the real token was taken.

The paste body is:

```text
HBCANARY hbcanaryrun_<random> canary=hbcanary_<random> sha=<sha256>
```

## Run

1. Put the **contents** of this folder in a public GitHub repository. `package.json`
   must be at the repository root.
2. In Arc Studio choose **New project → Import from GitHub**, select the repository,
   and open the new app.
3. Wait for Preview, then open:

   ```
   https://<preview-address>/hb_canary_url
   ```

4. Open the `paste.rs` link. You should see `HBCANARY ... canary=...`.

The same dummy line is available at:

```
https://<preview-address>/hb_canary_line
```

## Screenshot safely

Use `/hb_canary_line`, **not** the raw `.env` file, for screenshots. The app's `.env`
also contains a live token; do not screenshot the whole file or share it.

The canary line and the paste body should match. That is the evidence that the value
came from `.env` and left the sandbox.

## Filter note

This still performs a real outbound request, so Arc's safety filter may block it. The
code is deliberately limited to a dummy canary; there is no hidden or obfuscated
payload. If the platform blocks it, use the earlier captured evidence rather than
trying to disguise it.

## Safety

- Use only your own throwaway app.
- Testnet only; no mainnet, wallet, or funds.
- Do not change the code to read or send the real token.
- Delete the app and repo when finished.
