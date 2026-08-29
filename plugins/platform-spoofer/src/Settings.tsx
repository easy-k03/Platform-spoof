import { useObservable } from "@bunny/api/storage";
import { TableRadioGroup, TableRadioRow, TableSwitchRow, Text } from "@bunny/metro/common/components";
import { DEFAULT_PLATFORM, PLATFORM_PRESETS } from "./platforms";
import { storage } from "./storage";

declare module "@bunny/metro/common/components" {
    // Present in current Revenge builds, missing from bn-types 0.7.3
    interface TableRadioGroupProps {
        title: string;
        value?: string;
        defaultValue?: string;
        hasIcons?: boolean;
        onChange: <T extends string>(value: T) => void;
        children: React.ReactNode;
    }

    interface TableRadioRowProps {
        label: string | React.ReactNode;
        subLabel?: string | React.ReactNode;
        icon?: JSX.Element | false | null;
        value: string;
    }

    export const TableRadioGroup: React.FC<TableRadioGroupProps>;
    export const TableRadioRow: React.FC<TableRadioRowProps>;
}

export default () => {
    useObservable([storage]);

    return (
        <ReactNative.ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <TableRadioGroup
                title="Platform"
                value={storage.platform ?? DEFAULT_PLATFORM}
                onChange={value => (storage.platform = value)}
            >
                {Object.entries(PLATFORM_PRESETS).map(([value, preset]) => (
                    <TableRadioRow
                        key={value}
                        label={preset.label}
                        subLabel={preset.description}
                        value={value}
                    />
                ))}
            </TableRadioGroup>
            <TableSwitchRow
                label="Spoof super properties"
                subLabel="Also rewrite X-Super-Properties sent with REST requests"
                value={storage.spoofSuperProperties ?? true}
                onChange={value => (storage.spoofSuperProperties = value)}
            />
            <Text variant="text-md/normal" color="TEXT_MUTED">
                The platform is sent when Discord identifies with its gateway, so changes apply the next time a new session is created. If nothing changes after restarting, Discord resumed its old session — force-stop the app for about a minute (or toggle airplane mode) and open it again. A toast confirms when a spoofed identify is sent.
            </Text>
        </ReactNative.ScrollView>
    );
};
