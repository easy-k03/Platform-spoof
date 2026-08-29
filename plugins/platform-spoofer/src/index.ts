import { after, before, instead } from "@bunny/api/patcher";
import { findByProps } from "@bunny/metro";
import { showToast } from "@bunny/ui/toasts";
import { DEFAULT_PLATFORM, PLATFORM_PRESETS, type PlatformPreset, type SpoofProperties } from "./platforms";
import Settings from "./Settings";
import { storage } from "./storage";

const unpatches: Array<() => unknown> = [];
const timers: Array<ReturnType<typeof setTimeout>> = [];

let installed = false;
let lastToast = 0;

function activePreset(): PlatformPreset {
    try {
        return PLATFORM_PRESETS[storage.platform ?? DEFAULT_PLATFORM] ?? PLATFORM_PRESETS[DEFAULT_PLATFORM];
    } catch {
        // Storage may not be initialized yet during early startup
        return PLATFORM_PRESETS[DEFAULT_PLATFORM];
    }
}

function spoofWantsSuperProperties(): boolean {
    try {
        return storage.spoofSuperProperties ?? true;
    } catch {
        return true;
    }
}

/** Rewrite the gateway IDENTIFY properties object in place. */
function spoofIdentify(properties: Record<string, unknown>) {
    const { properties: preset } = activePreset();

    for (const key of Object.keys(preset) as Array<keyof SpoofProperties>) {
        properties[key] = preset[key];
    }
    if (preset.device === undefined) delete properties.device;
}

/** Fields of a super properties object that must stay untouched. */
const SUPER_PROPERTIES_KEEP = ["client_build_number", "release_channel", "system_locale", "client_event_source"];

/** Build a spoofed super properties object, keeping build/channel/locale intact. */
function spoofSuperProperties(res: Record<string, unknown>) {
    const { properties: preset } = activePreset();
    const spoofed = { ...res };

    for (const key of Object.keys(preset) as Array<keyof SpoofProperties>) {
        spoofed[key] = preset[key];
    }
    spoofed.device = preset.device ?? "";
    for (const key of SUPER_PROPERTIES_KEEP) {
        if (res[key] !== undefined) spoofed[key] = res[key];
    }

    return spoofed;
}

function notifySpoofed(layer: string) {
    const now = Date.now();
    if (now - lastToast < 10_000) return;
    lastToast = now;

    try {
        showToast(`Platform Spoofer: sent identify as ${activePreset().label} (${layer})`);
    } catch {
        // Toast module may not be up yet during early startup
    }
}

/**
 * Layer 1: patch the gateway session module's identify function directly,
 * rewriting the properties of the payload it receives.
 */
function patchGatewayIdentify(): boolean {
    const candidates = [
        findByProps("_doIdentify"),
        findByProps("sendIdentify"),
        findByProps("identify", "reconnect"),
        findByProps("identify", "logout")
    ];

    let patched = false;

    for (const session of candidates) {
        if (session == null) continue;

        // The module may export the socket instance itself, or its class
        for (const target of [session, session.prototype]) {
            if (target == null || typeof target !== "object") continue;

            for (const key of Object.keys(target)) {
                let value: unknown;
                try {
                    value = target[key];
                } catch {
                    continue;
                }
                if (typeof value !== "function") continue;

                let relevant = key === "_doIdentify" || key === "sendIdentify" || key === "identify";
                if (!relevant) {
                    try {
                        relevant = value.toString().includes("IDENTIFY");
                    } catch {
                        continue;
                    }
                }
                if (!relevant) continue;

                try {
                    unpatches.push(instead(key, target, (args: any[], orig: (...a: unknown[]) => unknown) => {
                        const properties = args?.[0]?.properties;
                        if (properties != null && typeof properties === "object") {
                            spoofIdentify(properties);
                            notifySpoofed("gateway");
                        }
                        return orig(...args);
                    }));
                    patched = true;
                } catch {
                    // Module is frozen or otherwise unpatchable
                }
            }
        }
    }

    return patched;
}

/**
 * Layer 2: patch getSuperProperties, which feeds both the X-Super-Properties
 * header and, on several client builds, the gateway IDENTIFY properties.
 */
function patchSuperProperties(): boolean {
    const superProperties = findByProps("getSuperProperties");
    if (superProperties == null) return false;

    try {
        unpatches.push(
            after("getSuperProperties", superProperties, (_args: unknown[], res: Record<string, unknown>) => {
                if (!spoofWantsSuperProperties() || res == null || typeof res !== "object") return res;
                return spoofSuperProperties(res);
            })
        );
        return true;
    } catch {
        return false;
    }
}

/**
 * Layer 3: last-resort safety net — rewrite outgoing gateway IDENTIFY frames
 * straight off the WebSocket, regardless of which module produced them.
 */
function patchWebSocket(): boolean {
    try {
        unpatches.push(
            before("send", WebSocket.prototype, (args: unknown[]) => {
                const data = args[0];
                // Gateway frames are JSON strings; IDENTIFY (op 2) is the only op carrying properties
                if (typeof data !== "string" || !data.includes('"op":2')) return;

                let payload: any;
                try {
                    payload = JSON.parse(data);
                } catch {
                    return;
                }

                if (payload?.op !== 2 || payload.d?.properties == null || typeof payload.d.properties !== "object") return;

                spoofIdentify(payload.d.properties);
                args[0] = JSON.stringify(payload);
                notifySpoofed("websocket");
            })
        );
        return true;
    } catch {
        return false;
    }
}

function installPatches() {
    if (installed) return;
    installed = true;

    patchWebSocket();

    // The gateway module may not be in metro's cache yet when plugins start.
    // Retry the metro-based layers for up to ~a minute.
    let attempts = 0;
    const attemptMetro = () => {
        attempts++;
        try {
            patchGatewayIdentify();
            patchSuperProperties();
        } catch {
            // Finders can throw while the module cache is still populating
        }
    };

    attemptMetro();
    // eslint-disable-next-line no-constant-condition
    while (attempts <= 20) {
        timers.push(setTimeout(attemptMetro, attempts * 3_000));
        attempts++;
    }
}

function clearAll() {
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;

    for (const unpatch of unpatches) {
        try {
            unpatch();
        } catch {
            // Ignore unpatch failures during teardown
        }
    }
    unpatches.length = 0;

    installed = false;
}

export default definePlugin({
    start() {
        installPatches();
    },
    stop() {
        clearAll();
    },
    SettingsComponent: Settings
});
