# Revenge Platform Spoofer

A [Revenge](https://github.com/revenge-mod) plugin that spoofs the platform you appear to be using
on Discord — ported from Equicord's
[PlatformSpoofer](https://github.com/Equicord/Equicord) plugin.

## What it does

Discord sends a `properties` object inside the gateway `IDENTIFY` payload. The `browser`/`os`
values in it decide how your session shows up to others: the phone/desktop/web badge on your
profile, the platform indicator next to your name, and the device listed under
Settings → Devices.

This plugin intercepts outgoing gateway `IDENTIFY` frames and rewrites those properties, letting
you appear as:

| Option    | Sent as                                    |
| --------- | ------------------------------------------ |
| Desktop   | `Discord Client` · Windows                 |
| Web       | `Chrome` · Windows                         |
| Android   | `Discord Android` · Android                |
| iOS       | `Discord iOS` · iPhone                     |
| Embedded  | `Discord Embedded` · Xbox                  |

Only the gateway identify payload is modified — REST requests and their
`X-Super-Properties` header are left untouched, so experiments and features are unaffected.

## Installation

Requires the latest Revenge. In Revenge: **Settings → Plugins → Install a plugin** (the + /
Install button) and paste:

```
https://raw.githubusercontent.com/easy-k03/Platform-spoof/main/dist/vendetta/revenge.platformspoofer/
```

You will get an "unproxied source" confirmation — tap **Continue** (you are trusting your own
repo). The plugin then appears in the Plugins list, where you can enable it and open its
settings to pick a platform.

A Bunny repository build (`dist/repo.json` + `dist/builds/`) is also produced for loaders that
support adding plugin repositories.

For local development:

```sh
pnpm install
pnpm run build        # outputs dist/
pnpm run build:dev    # dev builds (always re-fetched)
pnpm run typecheck
```

## Notes

- The platform is only sent when Discord creates a new gateway session. After changing the
  setting, restart the app (or wait for a reconnect that starts a fresh session) for it to apply.
- RESUME payloads are not modified on purpose — Discord keeps the client info of the resumed
  session.

## Credits

- Original Equicord plugin by [Drag](https://github.com/dragalt) — this is a direct port of its
  behaviour to Revenge's plugin API.
