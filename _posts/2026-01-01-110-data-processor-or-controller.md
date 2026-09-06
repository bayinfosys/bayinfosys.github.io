---
date: 2026-09-06
layout: article
title: "Are You a Data Controller or a Processor?"
seo_title: "Cookieless Analytics and GDPR: When Request Data Is Not Personal Data"
description: "Two regimes govern analytics data and they test different things. PECR asks whether you stored anything on the device. GDPR asks whether you can identify anyone. A 2025 CJEU judgment changed the answer to the second, and the first is still where most systems fail."
keywords: ["is pseudonymised data personal data", "PECR analytics consent", "cookieless analytics gdpr", "gclid personal data", "analytics without cookie banner", "EDPS v SRB", "server side tagging gdpr", "data controller or processor analytics"]
topic: "Security & Resilience"
clusters: ["regulatory"]
role: acquisition
related:
  - 09-data-risks
  - 73-ner-and-pii
  - 42-software-engineering-solved-governance
  - 65-why-private-inference
  - 58-multi-tennant
---

# Are You a Data Controller or a Processor?

Machine learning work is data work, so the legal position on storing, moving and processing that data belongs in the engineering rather than in a review at the end. This piece covers one narrow category: request data of the kind that already sits in server logs and analytics events. It is not legal advice, and other categories raise different questions. (If your situation involves those, [get in touch](/contact) or ask your legal representative.)

Two regimes apply to that data and they test different things. Most discussion collapses them into one, which is why so many teams reach the wrong answer confidently. One regime asks whether you put anything on the user's device. The other asks whether what you hold can be traced to a person. A system can pass the second and fail the first, and failing the first is the common case.

## The device question comes first

In the UK, Regulation 6 of the Privacy and Electronic Communications Regulations governs storing information on, or reading information from, a user's terminal equipment. The EU equivalent is Article 5(3) of the ePrivacy Directive. Consent is required unless the storage is strictly necessary to provide a service the user has explicitly requested.

Three properties of that rule are worth stating plainly, because each of them catches somebody.

It is technology-neutral. The word "cookie" appears in the popular name for the rule and not in the mechanism it describes. The ICO applies it to local storage, session storage, and device fingerprinting on the same basis. Replacing a cookie with `localStorage` changes nothing.

It does not ask what the stored value means. A random identifier containing no personal data at all still engages the rule, because the regulated act is the storage rather than the content. This is where the intuition fails: teams reason that their identifier is meaningless, conclude they hold no personal data, and never notice they are being tested on a different question.

And analytics does not qualify as strictly necessary. The ICO's position is that the exemption covers what the user asked for, and nobody visits a website in order to be measured. First-party analytics is still analytics.

So a system that writes anything to the device needs consent, and the GDPR analysis never gets started. The only way past is to store nothing there.

That is achievable, and it constrains the design in one specific way. A session identifier generated fresh on each page load, transmitted with the event and never written back, touches nothing. What you give up is continuity: the server sees a sequence of page loads rather than a visit, and reconstructing a journey across pages requires either device storage or server-side stitching from other signals. That is a real cost and it is the cost of the exemption.

## The identity question is now relative

Assume the device question is settled. The remaining question is whether the data you hold is personal data, and the answer to that changed on 4 September 2025.

In EDPS v SRB (C-413/23 P), the Court of Justice ruled that pseudonymised data is not automatically personal data in every case and for every party. What matters is whether the party in question can realistically re-identify the individual. It was the first judgment to state explicitly that the same data can be personal data for the original controller, which holds the key, and not for a recipient who cannot reverse the pseudonymisation and has no other route to identification. The Court confirmed the interpretation applies under the GDPR and not only under the regulation governing EU institutions.

The practical effect is that identifiability is a property of a relationship rather than of a field. The same string can be personal data in one organisation's hands and anonymous in another's.

The European Data Protection Board has moved to match. Its draft Guidelines 02/2026 on Anonymisation, published on 7 July 2026, adopt the relative approach the Court endorsed. That is a reversal: the EDPB's January 2025 draft on pseudonymisation had stated that pseudonymised data counts as personal data even where the recipient lacks the additional information needed to re-identify anyone.

Which is the reason to treat this as current rather than settled. Two drafts in eighteen months took opposite positions, the anonymisation guidelines remain in draft, and the judgment has been referred back to the General Court on the remaining procedural points. The substantive findings are authoritative. The guidance built on them is not finished.

## The click identifier case

The clearest application is an identifier that is meaningful only to the party that issued it.

A Google click identifier arrives in the landing page URL when someone clicks an advert. It resolves to a specific click, and through that to a user, in Google's systems and nowhere else. An intermediary that receives it, stores it alongside a page path and a timestamp, and later sends it back to Google with a conversion, has at no point held anything it could resolve to a person. Google learns that a click it already knew about produced a conversion. It learns nothing new about who.

Under the relative test that intermediary is not processing personal data, while Google plainly is. The judgment is what makes this statable rather than merely arguable.

Two qualifications, both of which matter more than the headline.

The test looks at the recipient's total means rather than at the field in isolation. An identifier alongside a user agent, a timestamp, a request sequence and an IP address is a more distinctive combination than any of them alone, and a regulator assesses the combination. Storing the autonomous system number rather than the address removes the field with the clearest route to a subscriber, and the honest claim is about what you have no lawful means to do rather than about what you happen not to hold.

And the obligation to inform does not move. The Court was explicit that the duty to tell people what happens to their data is assessed prospectively, at the point of collection, from the controller's perspective, and cannot rest on whether a downstream recipient might identify anyone later. The site operator remains the controller. Their privacy notice still has to say that a click identifier is collected and forwarded. A vendor being outside scope is not the customer being outside scope, and any vendor implying otherwise is selling you a problem.

There is also a contractual layer underneath the statutory one. Google's own EU user consent policy requires advertisers to obtain consent for ad measurement from users in the EEA. Satisfying the GDPR does not satisfy that, and it is enforced by contract rather than by a regulator.

## What this implies for how you build

The rules that fall out are all design decisions rather than compliance decisions, and each is cheaper at build time than afterwards.

Write nothing to the device. Generate the session identifier per request and let it live in the payload. Hold no field you could resolve to a person by any lawful route, which in practice means the autonomous system number rather than the address, and no free-text field that a user could type a name into. Make forwarding opt-in per destination and per field, so the decision to send an identifier somewhere is an explicit act with a record. Carry the consent state as a field, so a customer who does need consent can pass their signal through rather than working around you.

The last one is the point most easily missed. A system that cannot represent consent forces every customer into the same posture, and the customer who wants advert measurement and the customer who wants no third-party processing are asking for incompatible things from the same product.

None of this is difficult. It is difficult to retrofit, because the identifier scheme and the storage model are decided early and everything downstream assumes them. The regimes above are best read as constraints on the first week of a project rather than as a review in the last.

[Clientlog](https://www.clientlog.bayis.co.uk) is built to these constraints: no device storage, no address retention, forwarding opt-in per destination. The implementation notes are on its own site.

(If you are working out where your analytics or model pipeline sits against this, [get in touch](/contact).)
