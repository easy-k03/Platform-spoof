import { createStorage } from "@bunny/plugin";

export interface Storage {
    platform: string;
}

export const storage = createStorage<Storage>();
