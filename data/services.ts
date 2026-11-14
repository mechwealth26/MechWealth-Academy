/**
 * MECHWEALTH financial-service content.
 * Copy stays procedural and educational: no returns, approvals, timelines or
 * claim outcomes are promised.
 */

export type ServiceMotifId =
  | "demat"
  | "mutual"
  | "insurance"
  | "physical"
  | "iepf";

export interface ServiceArea {
  title: string;
  body: string;
}

export interface ServiceStep {
  title: string;
  body: string;
}

export interface Service {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  category: string;
  tagline: string;
  heroTitle: [string, string];
  motif: ServiceMotifId;
  metaDescription: string;
  summary: string;
  whyItMatters: string;
  areas: ServiceArea[];
  steps: ServiceStep[];
  whoFor: string[];
  outcomes: string[];
  distinctions: ServiceArea[];
  prepare: string[];
  importantNote: string;
  ctaTitle: string;
  ctaBody: string;
}

export const SERVICES: Service[] = [
  {
    slug: "demat-trading-account",
    index: "01",
    title: "Demat & Trading Account",
    shortTitle: "Demat account",
    category: "Market access",
    tagline:
      "Set up the account behind your investing with guided checks, clear explanations and a proper platform orientation.",
    heroTitle: ["A clean start for", "every market decision."],
    motif: "demat",
    metaDescription:
      "Guided demat and trading account opening, verification and platform orientation — explained clearly and handled systematically.",
    summary:
      "A demat account holds securities electronically; a linked trading account lets you place market orders through a broker. We help you move from documents to an activated setup without treating the process like a form-filling race.",
    whyItMatters:
      "Small onboarding errors can create large administrative problems later: mismatched names, incomplete nominees, unclear charges or a platform you do not understand. A considered setup gives you a cleaner operational base before capital is involved.",
    areas: [
      { title: "Account architecture", body: "Understand the roles of the bank, broker, exchange and depository—and how money and securities move between them." },
      { title: "Document & KYC review", body: "Prepare the required identity, bank and verification details, then check them for consistency before submission." },
      { title: "Activation & linking", body: "Follow the application through verification, account creation and the correct linking of bank and demat details." },
      { title: "Platform orientation", body: "Learn the essential screens, order types, contract notes, holdings view and safety practices before your first transaction." },
    ],
    steps: [
      { title: "Define the use", body: "We begin with what the account needs to support—not with a product pitch." },
      { title: "Prepare correctly", body: "Documents and account details are reviewed together before they enter the workflow." },
      { title: "Verify & activate", body: "We stay with the application through the broker and depository checks." },
      { title: "Learn the controls", body: "You receive a practical walkthrough so the account is understandable, not merely active." },
    ],
    whoFor: [
      "First-time investors who want to understand the setup before using it",
      "People moving from an old broker or bringing scattered accounts into order",
      "Families adding nominees or correcting foundational account details",
    ],
    outcomes: [
      "A correctly structured and verified account application",
      "A clear view of charges, records and operational responsibilities",
      "Confidence using the core platform controls and account documents",
      "A known person to contact for account-administration questions",
    ],
    distinctions: [
      { title: "Explanation before activation", body: "We make the account structure legible before asking you to use it." },
      { title: "Checks before submission", body: "Names, bank information and supporting records are reviewed as one system." },
      { title: "Education stays separate", body: "Account support never becomes a promise of market performance or a trade recommendation." },
    ],
    prepare: ["PAN and applicable KYC records", "Aadhaar-linked mobile access where required", "Bank proof and a usable email address"],
    importantNote:
      "Account opening remains subject to current KYC requirements and broker/depository approval. Trading and investing involve market risk; this service does not include return commitments or personalised investment advice.",
    ctaTitle: "Begin with an account you understand.",
    ctaBody: "Tell us whether you are opening, moving or correcting an account. We will explain the cleanest next step.",
  },
  {
    slug: "mutual-funds",
    index: "02",
    title: "Mutual Funds",
    shortTitle: "Mutual funds",
    category: "Planned investing",
    tagline:
      "Build an understandable mutual-fund process around purpose, time horizon and risk—not last year’s leaderboard.",
    heroTitle: ["A portfolio you can", "understand before you fund."],
    motif: "mutual",
    metaDescription:
      "Mutual fund category education, transaction support and periodic review with a disciplined, risk-aware process.",
    summary:
      "Mutual funds pool investor money into professionally managed portfolios. Our role is to make the categories, documents, risks and transaction process understandable, then help you maintain an organised view of what you hold.",
    whyItMatters:
      "A collection of popular schemes is not automatically a plan. Purpose, time horizon, liquidity and risk need to fit together; otherwise even good products can become a confusing portfolio with no clear job.",
    areas: [
      { title: "Goal framing", body: "Translate a broad intention into a usable time horizon, contribution pattern and liquidity need." },
      { title: "Category literacy", body: "Understand equity, debt, hybrid and other categories through mandate and risk rather than recent returns." },
      { title: "Transaction support", body: "Set up SIP or lump-sum transactions, nominations and records with confirmation at each step." },
      { title: "Portfolio housekeeping", body: "Bring existing holdings into one view and review whether each scheme still has a clear role." },
    ],
    steps: [
      { title: "Name the purpose", body: "We clarify what the money is for, when it may be needed and what uncertainty is acceptable." },
      { title: "Understand the options", body: "Relevant categories and scheme documents are explained in plain language." },
      { title: "Set up deliberately", body: "Transactions are completed only after mandate, risk and process are understood." },
      { title: "Review the structure", body: "Periodic conversations focus on fit and discipline, not constant activity." },
    ],
    whoFor: [
      "New investors starting a first SIP with questions they want answered",
      "Long-term savers who want a defined process instead of product chasing",
      "Existing investors with duplicated, scattered or poorly understood holdings",
    ],
    outcomes: [
      "A purpose assigned to each part of the portfolio",
      "A clearer understanding of category, mandate, cost and risk",
      "Organised transaction records, nominations and holding visibility",
      "A review rhythm designed to reduce reactive decision-making",
    ],
    distinctions: [
      { title: "Mandate over momentum", body: "Products are discussed through what they are built to do—not what recently performed best." },
      { title: "Fewer, clearer decisions", body: "The aim is an understandable structure, not a crowded catalogue of funds." },
      { title: "No performance theatre", body: "Market-linked returns fluctuate. Reviews do not imply or promise a particular outcome." },
    ],
    prepare: ["A list of current holdings, if any", "The purpose and likely time horizon for the money", "PAN, bank and KYC details for transactions"],
    importantNote:
      "Mutual fund investments are subject to market risks. Scheme documents and the Riskometer should be read carefully. Suitability depends on individual circumstances; no return or capital-protection outcome is guaranteed.",
    ctaTitle: "Give every investment a clear job.",
    ctaBody: "Bring your questions—or your current portfolio. We will start by making the structure understandable.",
  },
  {
    slug: "life-health-insurance",
    index: "03",
    title: "Life & Health Insurance",
    shortTitle: "Insurance",
    category: "Financial protection",
    tagline:
      "Examine cover through needs, terms and exclusions so protection is designed before a policy is selected.",
    heroTitle: ["Protection designed around", "real consequences."],
    motif: "insurance",
    metaDescription:
      "Life and health insurance support focused on needs, policy terms, exclusions, documentation and continuity of cover.",
    summary:
      "Life insurance protects dependants against the financial effect of a death; health insurance helps manage eligible medical costs. We help map the need, examine policy language and complete the process with fewer blind spots.",
    whyItMatters:
      "A policy can look reassuring while leaving important gaps in sum insured, waiting periods, exclusions, disclosures or continuity. The meaningful question is not whether a policy exists, but what it would actually do when called upon.",
    areas: [
      { title: "Needs assessment", body: "Map dependants, liabilities, existing cover, medical needs and the financial consequences a policy must address." },
      { title: "Terms & exclusions", body: "Compare waiting periods, co-payments, sub-limits, exclusions and disclosure requirements—not only premium." },
      { title: "Application discipline", body: "Prepare accurate declarations and supporting documents so the proposal reflects the real risk." },
      { title: "Continuity & claims guidance", body: "Keep renewals, nominations, policy records and the claim process visible to the family." },
    ],
    steps: [
      { title: "Map the exposure", body: "We identify who and what needs protection, including cover already in place." },
      { title: "Read the contract", body: "Suitable options are compared through benefits, definitions, exclusions and obligations." },
      { title: "Disclose accurately", body: "The proposal is completed with care; material facts are never treated as optional." },
      { title: "Keep it usable", body: "Policy records, renewals and family awareness are organised for continuity." },
    ],
    whoFor: [
      "Families reviewing whether existing protection matches current responsibilities",
      "Individuals buying life or health cover for the first time",
      "People who want policy language explained before they commit",
    ],
    outcomes: [
      "A documented view of protection needs and existing gaps",
      "A clearer comparison of material policy terms and trade-offs",
      "Accurate, organised application and nomination records",
      "A practical renewal and family-documentation routine",
    ],
    distinctions: [
      { title: "Cover before premium", body: "The conversation begins with financial exposure, not the cheapest quote." },
      { title: "Contract before brochure", body: "Definitions, exclusions and obligations receive the same attention as headline benefits." },
      { title: "Long-term continuity", body: "A policy is treated as a living family record, not a one-time transaction." },
    ],
    prepare: ["Current policy schedules and renewal details", "A view of dependants, liabilities and employer cover", "Accurate health and medical history for proposal disclosures"],
    importantNote:
      "Insurance issuance and claims are subject to underwriting, policy terms, exclusions and the insurer’s decision. Full and accurate disclosure is essential. MECHWEALTH does not guarantee issuance or claim approval.",
    ctaTitle: "Make protection understandable before it is urgent.",
    ctaBody: "Share what is already covered and what still concerns you. We will help structure the questions that matter.",
  },
  {
    slug: "physical-share-services",
    index: "04",
    title: "Physical Share Services",
    shortTitle: "Physical shares",
    category: "Legacy holdings",
    tagline:
      "Bring paper certificates, inherited holdings and record mismatches into a documented dematerialisation process.",
    heroTitle: ["Move legacy holdings", "from paper to progress."],
    motif: "physical",
    metaDescription:
      "Physical share dematerialisation, transmission and record-correction support with document review and systematic follow-through.",
    summary:
      "Physical share work connects old certificates and company records to today’s demat system. Cases may involve dematerialisation, transmission after a holder’s death, name or signature differences, duplicate records or registrar correspondence.",
    whyItMatters:
      "The asset may still exist even when its paper trail is incomplete. Progress depends on reconstructing ownership carefully and satisfying the company, registrar, depository participant and—in transmission cases—legal-document requirements.",
    areas: [
      { title: "Certificate inventory", body: "Catalogue companies, folio numbers, holder names, certificate details and the apparent status of each holding." },
      { title: "Dematerialisation", body: "Prepare the depository request and supporting records needed to convert eligible certificates into electronic holdings." },
      { title: "Transmission & succession", body: "Structure the document path when holdings must move after the death of a registered holder." },
      { title: "Record correction", body: "Address name, signature, address or bank-detail differences through the appropriate registrar process." },
    ],
    steps: [
      { title: "Build the inventory", body: "Every certificate and available record is logged before any application is prepared." },
      { title: "Identify the route", body: "We separate straightforward demat cases from correction, transmission or IEPF matters." },
      { title: "Prepare the record", body: "Forms, declarations and supporting documents are assembled against the specific case." },
      { title: "Track the correspondence", body: "Queries and registrar responses are recorded until the case reaches its available conclusion." },
    ],
    whoFor: [
      "Families who have found old or inherited paper share certificates",
      "Investors facing name, signature or ownership-record mismatches",
      "Holders who need a clear view of several unresolved certificates",
    ],
    outcomes: [
      "A documented inventory of certificates and case status",
      "A case-specific route instead of repeated generic submissions",
      "Prepared forms and an organised supporting-document set",
      "A visible correspondence trail for follow-up and handover",
    ],
    distinctions: [
      { title: "Case first, form second", body: "We identify the legal and record issue before choosing the paperwork." },
      { title: "One case ledger", body: "Certificates, submissions, replies and pending actions stay connected in one working view." },
      { title: "No false shortcuts", body: "Legacy cases can be slow and fact-specific; complexity is explained rather than hidden." },
    ],
    prepare: ["Original certificates and any old statements", "Identity and address records for relevant holders", "Succession or legal documents where ownership has changed"],
    importantNote:
      "Requirements and completion times vary by company, registrar, depository participant and the facts of the holding. Document review does not guarantee dematerialisation or transmission.",
    ctaTitle: "Turn the paper trail into a case plan.",
    ctaBody: "Start with the certificates and records you have. We will help identify what each holding needs next.",
  },
  {
    slug: "iepf-claims",
    index: "05",
    title: "IEPF Claims",
    shortTitle: "IEPF claims",
    category: "Asset recovery",
    tagline:
      "Build and follow a documented claim for eligible shares and dividends transferred to the IEPF Authority.",
    heroTitle: ["Turn an old entitlement", "into a documented claim."],
    motif: "iepf",
    metaDescription:
      "IEPF share and dividend claim support covering entitlement checks, IEPF-5 preparation, company verification and follow-through.",
    summary:
      "When dividends remain unclaimed for the prescribed period, related shares may be transferred to the Investor Education and Protection Fund. Recovery requires an IEPF claim, supporting evidence and verification by the company’s nodal process.",
    whyItMatters:
      "IEPF recovery is not one form in isolation. Holder records, entitlement details, demat information, company verification and authority queries must agree. A structured claim file reduces avoidable gaps and makes every pending action visible.",
    areas: [
      { title: "Entitlement research", body: "Trace company, folio, dividend and transfer records to establish what may be available to claim." },
      { title: "Claim-file preparation", body: "Organise IEPF-5 information, identity, bank, demat and company-specific supporting records." },
      { title: "Company verification", body: "Coordinate the documentation required for the company’s verification report and respond to deficiencies." },
      { title: "Authority follow-through", body: "Track acknowledgements, queries and status milestones while preserving a complete case record." },
    ],
    steps: [
      { title: "Verify the entitlement", body: "We begin with records that connect the claimant, company, folio and transferred asset." },
      { title: "Assemble the evidence", body: "Identity, demat, bank and supporting company records are brought into one claim file." },
      { title: "File & verify", body: "The claim is submitted and the company-verification stage is followed carefully." },
      { title: "Track every query", body: "Responses, resubmissions and status changes remain documented until the authority decides." },
    ],
    whoFor: [
      "Investors whose old dividends and related shares may have moved to IEPF",
      "Legal heirs or successors working through an inherited entitlement",
      "Families with fragmented records who need the claim path organised",
    ],
    outcomes: [
      "A researched view of the apparent entitlement and claimant route",
      "A structured claim file with supporting records indexed",
      "Visible ownership of company and authority follow-ups",
      "A clear status trail, including deficiencies that still need action",
    ],
    distinctions: [
      { title: "Evidence-led preparation", body: "The claim begins with entitlement records, not assumptions about what is recoverable." },
      { title: "Company and authority aligned", body: "Both verification tracks are treated as connected parts of the same case." },
      { title: "Status without ambiguity", body: "Each submission, query and dependency is recorded in plain language." },
    ],
    prepare: ["Company, folio and old dividend or certificate records", "Claimant identity, bank and demat information", "Succession documents when the original holder is deceased"],
    importantNote:
      "Eligibility, document requirements, verification and release are determined by applicable rules, the company and the IEPF Authority. Claim filing cannot guarantee approval, quantity or completion time.",
    ctaTitle: "Start with evidence. Build the claim from there.",
    ctaBody: "Share the company and holder records available to you. We will help map the claim route and missing pieces.",
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
