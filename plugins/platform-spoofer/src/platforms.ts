export interface SpoofProperties {
    browser: string;
    os: string;
    device?: string;
    browser_user_agent?: string;
    browser_version?: string;
    os_version?: string;
}

export interface PlatformPreset {
    label: string;
    description: string;
    properties: SpoofProperties;
}

export const DEFAULT_PLATFORM = "desktop";

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
    desktop: {
        label: "Desktop",
        description: "Discord Client · Windows",
        properties: {
            browser: "Discord Client",
            os: "Windows",
            os_version: "10.0",
            browser_user_agent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9180 Chrome/126.0.6478.63 Electron/31.2.0 Safari/537.36",
            browser_version: "31.2.0"
        }
    },
    web: {
        label: "Web",
        description: "Chrome · Windows",
        properties: {
            browser: "Chrome",
            os: "Windows",
            os_version: "10.0",
            browser_user_agent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.63 Safari/537.36",
            browser_version: "126.0.6478.63"
        }
    },
    android: {
        label: "Android",
        description: "Discord Android",
        properties: {
            browser: "Discord Android",
            os: "Android"
        }
    },
    ios: {
        label: "iOS",
        description: "Discord iOS · iPhone",
        properties: {
            browser: "Discord iOS",
            os: "iOS",
            device: "iPhone"
        }
    },
    embedded: {
        label: "Embedded (Console)",
        description: "Discord Embedded · Xbox",
        properties: {
            browser: "Discord Embedded",
            os: "Xbox"
        }
    }
};
