import { before } from "@bunny/api/patcher";
import { DEFAULT_PLATFORM, PLATFORM_PRESETS } from "./platforms";
import Settings from "./Settings";
import { storage } from "./storage";

let unpatch: (() => boolean) | undefined;

function spoof(properties: Record<string, unknown>) {
    const preset = PLATFORM_PRESETS[storage.platform ?? DEFAULT_PLATFORM] ?? PLATFORM_PRESETS[DEFAULT_PLATFORM];

    properties.browser = preset.properties.browser;
    properties.os = preset.properties.os;
    if (preset.properties.device === undefined) delete properties.device;
    else properties.device = preset.properties.device;
}

export default definePlugin({
    start() {
        unpatch = before("send", WebSocket.prototype, args => {
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

            spoof(payload.d.properties);
            args[0] = JSON.stringify(payload);
        });
    },
    stop() {
        unpatch?.();
        unpatch = undefined;
    },
    SettingsComponent: Settings
});
