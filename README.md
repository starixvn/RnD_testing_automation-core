# sc-automation-core

## Installation

sc-automation-core requires [Node.js](https://nodejs.org/) v12+ to run.

Install the dependencies and devDependencies and start the server.

```sh
npm install sc-automation-core
```

## Setup

Fork the [demo project] (https://git3.nexdev.net/l1/ui-automation-tests/separated-game-demo), and update these files to setup your tests.

-   Add locators to locators/[your project]-locators.ts.
-   Add game configurations to [your project]-configs.ts.
-   Update file [your project]-smoke.spect.ts. You should choose the approriate game type for your tests.
-   Add account and product info to test-configs.
-   Run your tests.
