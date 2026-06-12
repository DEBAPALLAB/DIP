# Implementation Plan: Full SEO Strategy Execution

Execute the SEO strategy from [seo_strategy.md](file:///C:/Users/Dasad/.gemini/antigravity-ide/brain/ea93644d-029b-4aee-bd6a-bb458a286e5f/seo_strategy.md) across all marketing pages.

---

## Proposed Changes

### Root Layout & Infrastructure

#### [MODIFY] [layout.tsx](file:///d:/codings/formy/superform-v2/app/layout.tsx)
- Add `metadataBase: new URL("https://superforms.in")` so all relative OG image URLs resolve correctly
- Enhance the default metadata with `title.template` pattern: `"%s | Superforms"` so child pages get consistent branding

#### [MODIFY] [sitemap.ts](file:///d:/codings/formy/superform-v2/app/sitemap.ts)
- Add new routes: `/ai-form-builder`, `/beautiful-forms`, `/google-forms-alternative`, `/typeform-alternative`, `/blog`
- Set appropriate `changeFrequency` and `priority` values

---

### Existing Pages (Metadata + Schema Updates)

#### [MODIFY] [page.tsx (Home)](file:///d:/codings/formy/superform-v2/app/(marketing)/page.tsx)
- Update title, description, keywords, OG tags per SEO strategy
- Update JSON-LD `SoftwareApplication` schema with richer data
- Add `Organization` schema

#### [MODIFY] [page.tsx (Features)](file:///d:/codings/formy/superform-v2/app/(marketing)/features/page.tsx)
- Update title, description, keywords, OG tags per SEO strategy
- Update `FAQPage` JSON-LD with the 3 questions from strategy doc

#### [MODIFY] [page.tsx (Pricing)](file:///d:/codings/formy/superform-v2/app/(marketing)/pricing/page.tsx)
- Update title, description, keywords, OG tags per SEO strategy
- Replace `Product` schema with `FAQPage` schema (pricing FAQs are more valuable for rich snippets)

#### [MODIFY] [page.tsx (Showcase)](file:///d:/codings/formy/superform-v2/app/(marketing)/showcase/page.tsx)
- Update title, description, keywords, OG tags per SEO strategy
- Add `CollectionPage` + `ItemList` JSON-LD schema

---

### New Landing Pages

> [!IMPORTANT]
> All 5 new pages will be server-only components with metadata exports and minimal UI. They will contain SEO-optimized intro copy, H1/H2 heading hierarchy, JSON-LD schemas, and clear CTAs linking to the app. The UI will reuse the existing marketing layout. **No changes to existing client components.**

#### [NEW] `app/(marketing)/ai-form-builder/page.tsx`
- Full server component with metadata, FAQPage JSON-LD, and intro content
- H1: "AI Form Builder That Understands What You Need"

#### [NEW] `app/(marketing)/beautiful-forms/page.tsx`
- Full server component with metadata, WebPage JSON-LD, and intro content
- H1: "Build Beautiful Forms People Actually Complete"

#### [NEW] `app/(marketing)/google-forms-alternative/page.tsx`
- Full server component with metadata, FAQPage JSON-LD, and comparison content
- H1: "The Best Google Forms Alternative"

#### [NEW] `app/(marketing)/typeform-alternative/page.tsx`
- Full server component with metadata, FAQPage JSON-LD, and comparison content
- H1: "The Typeform Alternative Without the Branding Tax"

#### [NEW] `app/(marketing)/blog/page.tsx`
- Placeholder server component with metadata and Blog JSON-LD
- H1: "Form Building Guides and Resources"

---

## Verification Plan

### Automated Tests
- `npm run build` to confirm all routes compile and generate static pages correctly

### Manual Verification
- Verify new routes appear in sitemap.xml
- Spot-check metadata in page source for each route
