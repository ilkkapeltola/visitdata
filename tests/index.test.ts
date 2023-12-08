import { exportedForTesting } from "../src/index";

const { getDomain_ } = exportedForTesting;

describe("Domain function", () => {
    it("should return the right top-level domains", () => {
        expect(getDomain_("https://www.google.com")).toEqual("google.com");
        expect(getDomain_("http://google.com/foo/bar?param=value")).toEqual("google.com");
        expect(getDomain_("https://www.google.co.uk")).toEqual("google.co.uk");
        expect(getDomain_("https://www.microsoft.com")).toEqual("microsoft.com");
        expect(getDomain_("https://www.wikipedia.org")).toEqual("wikipedia.org");
        expect(getDomain_("https://www.amazon.co.jp")).toEqual("amazon.co.jp");
        expect(getDomain_("https://www.google.co.in")).toEqual("google.co.in");
        expect(getDomain_("https://www.bbc.co.uk")).toEqual("bbc.co.uk");
        expect(getDomain_("http://localhost")).toEqual("localhost");
        expect(getDomain_("bbc.co.uk")).toEqual("bbc.co.uk");
        expect(getDomain_('')).toEqual(null);
        expect(getDomain_(null)).toEqual(null);
    });
});