import { Config } from "jest";
import { defaults } from "jest-config";

const config: Config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, "mts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  slowTestThreshold: 120,
  testTimeout: 120000,
  verbose: true,
};

export default config;
