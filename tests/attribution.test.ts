import { describe, it, expect } from "vitest";
import {
  attributionFromVisit,
  attributionMetadata,
  chooseAttribution,
  encodeAttribution,
  sourceFromReferrer,
  ATTRIBUTION_COOKIE,
} from "@/lib/attribution";

const SITE = "https://www.rtspaces.co.uk/";

describe("Where a visitor came from", () => {
  it("uses the utm_source tag on the studio's links", () => {
    expect(attributionFromVisit(`${SITE}?utm_source=instagram`, "")).toEqual({
      source: "instagram",
      campaign: "",
      tagged: true,
    });
    expect(attributionFromVisit(`${SITE}book-online?utm_source=TikTok&utm_campaign=Student Offer`, "")).toEqual({
      source: "tiktok",
      campaign: "student-offer",
      tagged: true,
    });
  });

  it("tidies tags so the same channel always reads the same", () => {
    expect(attributionFromVisit(`${SITE}?utm_source=IG`, "")?.source).toBe("instagram");
    expect(attributionFromVisit(`${SITE}?utm_source=%3Cscript%3E`, "")?.source).toBe("script");
  });

  it("falls back to the referring site for untagged visits", () => {
    expect(sourceFromReferrer("https://l.instagram.com/")).toBe("instagram");
    expect(sourceFromReferrer("https://www.google.co.uk/")).toBe("google");
    expect(sourceFromReferrer("https://www.tiktok.com/")).toBe("tiktok");
    expect(sourceFromReferrer("https://m.facebook.com/")).toBe("facebook");
    expect(sourceFromReferrer("https://t.co/abc")).toBe("x");
    expect(sourceFromReferrer("android-app://com.instagram.android")).toBe("instagram");
    expect(sourceFromReferrer("android-app://com.google.android.gm")).toBe("google");
    expect(sourceFromReferrer("https://www.someblog.co.uk/post")).toBe("someblog.co.uk");
    expect(sourceFromReferrer("")).toBe("direct");
  });

  it("never credits our own pages, Stripe or Cal.com", () => {
    expect(sourceFromReferrer("https://www.rtspaces.co.uk/services")).toBeNull();
    expect(sourceFromReferrer("https://checkout.stripe.com/c/pay/cs_live_x")).toBeNull();
    expect(sourceFromReferrer("https://app.cal.com/")).toBeNull();
    // Coming back from Stripe must not overwrite the real source.
    const instagram = attributionFromVisit(`${SITE}?utm_source=instagram`, "");
    const back = attributionFromVisit(`${SITE}book-online?success=true`, "https://checkout.stripe.com/");
    expect(chooseAttribution(instagram, back)).toEqual(instagram);
  });

  it("keeps the first visit, unless a tagged link replaces a guess", () => {
    const tiktok = attributionFromVisit(`${SITE}?utm_source=tiktok`, "");
    const google = attributionFromVisit(SITE, "https://www.google.com/");
    const direct = attributionFromVisit(SITE, "");
    expect(chooseAttribution(tiktok, direct)).toEqual(tiktok);
    expect(chooseAttribution(tiktok, attributionFromVisit(`${SITE}?utm_source=flyer`, ""))).toEqual(tiktok);
    expect(chooseAttribution(google, tiktok)).toEqual(tiktok);
    expect(chooseAttribution(direct, google)).toEqual(direct);
  });
});

describe("Checkout metadata", () => {
  const req = (cookie?: string) =>
    new Request("https://www.rtspaces.co.uk/api/checkout", { headers: cookie ? { cookie } : {} });

  it("copies the saved source into the Stripe session", () => {
    const value = encodeURIComponent(encodeAttribution({ source: "instagram", campaign: "student-offer", tagged: true }));
    expect(attributionMetadata(req(`other=1; ${ATTRIBUTION_COOKIE}=${value}`))).toEqual({
      source: "instagram",
      campaign: "student-offer",
    });
  });

  it("records unknown when there is no cookie, and ignores junk", () => {
    expect(attributionMetadata(req())).toEqual({ source: "unknown", campaign: "" });
    expect(attributionMetadata(req(`${ATTRIBUTION_COOKIE}=%%%`))).toEqual({ source: "unknown", campaign: "" });
  });
});
