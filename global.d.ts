// global.d.ts
export {};

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            toMatchBetOptions(b: Array<string>): R;
            toMatchWinning(b: any): R;
            toMatchWinningAndRefund(b: any): R;
        }
    }
}
