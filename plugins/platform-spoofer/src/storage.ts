import { createStorage } from "@bunny/plugin";

export interface Storage {
    platform: string;
    spoofSuperProperties: boolean;
}

export const storage = createStorage<Storage>();
