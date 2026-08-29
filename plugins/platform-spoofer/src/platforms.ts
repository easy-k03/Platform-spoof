export interface SpoofProperties {
    browser: string;
    os: string;
    device?: string;
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
            os: "Windows"
        }
    },
    web: {
        label: "Web",
        description: "Chrome · Windows",
        properties: {
            browser: "Chrome",
            os: "Windows"
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
