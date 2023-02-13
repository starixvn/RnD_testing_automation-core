import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

export const initTestEnv = (accounts: any, productId: string) => {
    if (accounts === null || productId === null) {
        throw new Error("Missing account productId data.");
    }

    const env = process.env.npm_config_env ?? "local";
    process.env.ProductId = productId;
    process.env.TestAccount = accounts[env];
};

export const testConfig: PlaywrightTestConfig = {
    testDir: "./tests",
    timeout: 120 * 1000,
    expect: {
        timeout: 10 * 1000,
        toMatchSnapshot: {
            maxDiffPixelRatio: 0.3,
        },
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    reporter: [["html", { open: "never" }]],
    use: {
        actionTimeout: 0,
        trace: "on-first-retry",
        headless: true,
        viewport: {
            width: 1280,
            height: 720,
        },
        screenshot: "only-on-failure",
        launchOptions: {
            // force GPU hardware acceleration (even in headless mode)
            // without hardware acceleration, our tests will be much slower
            args: ["--use-gl=egl"],
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "Smoke_CI",
            testMatch: `**/tests/*.smoke.spec.ts`,
            use: {
                ...devices["Desktop Chrome"],
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',
};
