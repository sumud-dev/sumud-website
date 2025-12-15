// Campaign data types and mock data for the campaigns feature

export interface LocalizedText {
  en: string;
  fi: string;
  ar: string;
}

export interface Resource {
  title: string;
  type: "guide" | "toolkit" | "article" | "video" | "petition";
  url: string;
  description?: string;
}

export interface SuccessStory {
  title: string;
  description: string;
  date: string;
  impact?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  type: "boycott" | "policy-advocacy" | "community-action" | "awareness";
  status: "active" | "completed" | "upcoming";
  imageUrl: string;
  startDate: string;
  endDate?: string;
  targets?: string[];
  demands?: string[];
  howToParticipate?: string[];
  resources?: Resource[];
  successStories?: SuccessStory[];
  callToAction: {
    primary: string;
    secondary?: string;
    actionUrl: string;
  };
  stats?: {
    supporters: number;
    actions: number;
    impact: string;
  };
}

// Mock campaign data - 6 campaigns matching the API route
const campaigns: Campaign[] = [
  {
    id: "1",
    slug: "justice-not-arms",
    title: {
      en: "Justice Not Arms",
      fi: "Oikeutta ei aseita",
      ar: "العدالة لا الأسلحة",
    },
    shortDescription: {
      en: "Demand Finland to end all arms trade and military cooperation with Israel.",
      fi: "Vaadi Suomea lopettamaan asekaupan ja sotilaallisen yhteistyön Israelin kanssa.",
      ar: "المطالبة بإنهاء فنلندا لجميع تجارة الأسلحة والتعاون العسكري مع إسرائيل.",
    },
    description: {
      en: "Campaign demanding Finland to end all arms trade and military cooperation with Israel until it complies with international humanitarian law.",
      fi: "Kampanja, joka vaatii Suomea lopettamaan asekaupan ja sotilaallisen yhteistyön Israelin kanssa, kunnes se noudattaa kansainvälistä humanitaarista oikeutta.",
      ar: "حملة تطالب فنلندا بإنهاء جميع تجارة الأسلحة والتعاون العسكري مع إسرائيل حتى تمتثل للقانون الإنساني الدولي.",
    },
    type: "policy-advocacy",
    status: "active",
    imageUrl: "/images/campaigns/justice-not-arms.jpg",
    startDate: "2024-01-01",
    demands: [
      "Immediate halt to all arms exports to Israel",
      "End military cooperation agreements",
      "Support UN arms embargo resolution",
    ],
    howToParticipate: [
      "Contact your elected representatives",
      "Sign the petition for arms embargo",
      "Attend local advocacy events",
    ],
    callToAction: {
      primary: "Sign the Petition",
      secondary: "Learn More",
      actionUrl: "/petitions/justice-not-arms",
    },
    stats: {
      supporters: 3200,
      actions: 450,
      impact: "Parliamentary motion tabled",
    },
  },
  {
    id: "2",
    slug: "bds-movement",
    title: {
      en: "BDS Movement - Boycott, Divestment, Sanctions",
      fi: "BDS-liike - Boikotti, Divestointi, Sanktiot",
      ar: "حركة المقاطعة - مقاطعة، سحب استثمارات، عقوبات",
    },
    shortDescription: {
      en: "Join the global movement for Palestinian rights through economic pressure on companies profiting from occupation.",
      fi: "Liity maailmanlaajuiseen liikkeeseen palestiinalaisten oikeuksien puolesta painostamalla taloudellisesti miehityksestä hyötyviä yrityksiä.",
      ar: "انضم إلى الحركة العالمية من أجل حقوق الفلسطينيين من خلال الضغط الاقتصادي على الشركات المستفيدة من الاحتلال.",
    },
    description: {
      en: "The BDS movement calls for boycotts, divestment, and sanctions against Israel until it complies with international law.",
      fi: "BDS-liike vaatii boikotteja, divestointia ja sanktioita Israelille, kunnes se noudattaa kansainvälistä oikeutta.",
      ar: "تدعو حركة المقاطعة إلى مقاطعة إسرائيل وسحب الاستثمارات منها وفرض عقوبات عليها حتى تمتثل للقانون الدولي.",
    },
    type: "boycott",
    status: "active",
    imageUrl: "/images/campaigns/bds.jpg",
    startDate: "2024-01-01",
    targets: [
      "HP Inc - Provides technology for military checkpoints",
      "Caterpillar - Equipment used to demolish Palestinian homes",
      "Puma - Sponsors Israeli football association",
    ],
    demands: [
      "End the occupation of Palestinian territories",
      "Full equality for Arab-Palestinian citizens of Israel",
      "Right of return for Palestinian refugees",
    ],
    howToParticipate: [
      "Avoid purchasing products from targeted companies",
      "Encourage institutions to divest from companies profiting from occupation",
      "Share information about the BDS movement",
    ],
    resources: [
      {
        title: "BDS Guide",
        type: "guide",
        url: "/resources/bds-guide",
        description: "Complete guide to the BDS movement",
      },
    ],
    callToAction: {
      primary: "Join the Movement",
      secondary: "Learn More",
      actionUrl: "https://bdsmovement.net",
    },
    stats: {
      supporters: 1500,
      actions: 250,
      impact: "Multiple divestments achieved",
    },
  },
  {
    id: "3",
    slug: "apartheid-free-zone",
    title: {
      en: "Apartheid Free Zone",
      fi: "Apartheid-vapaa vyöhyke",
      ar: "منطقة خالية من الفصل العنصري",
    },
    shortDescription: {
      en: "Join us in declaring your community, institution, or organization as an Apartheid Free Zone.",
      fi: "Liity julistamaan yhteisösi, instituutiosi tai organisaatiosi apartheid-vapaaksi vyöhykkeeksi.",
      ar: "انضم إلينا في إعلان مجتمعك أو مؤسستك أو منظمتك منطقة خالية من الفصل العنصري.",
    },
    description: {
      en: "Join us in declaring your community, institution, or organization as an Apartheid Free Zone - committed to opposing Israeli apartheid and supporting Palestinian rights.",
      fi: "Liity julistamaan yhteisösi, instituutiosi tai organisaatiosi apartheid-vapaaksi vyöhykkeeksi - sitoutuneena vastustamaan Israelin apartheidia ja tukemaan palestiinalaisten oikeuksia.",
      ar: "انضم إلينا في إعلان مجتمعك أو مؤسستك أو منظمتك منطقة خالية من الفصل العنصري - ملتزمة بمعارضة الفصل العنصري الإسرائيلي ودعم حقوق الفلسطينيين.",
    },
    type: "community-action",
    status: "active",
    imageUrl: "/images/campaigns/apartheid-free-zone.jpg",
    startDate: "2024-02-01",
    demands: [
      "Declare your space an Apartheid Free Zone",
      "Commit to not hosting Israeli state representatives",
      "Support Palestinian cultural events",
    ],
    howToParticipate: [
      "Register your organization as an Apartheid Free Zone",
      "Display the Apartheid Free Zone badge",
      "Educate your community about Israeli apartheid",
    ],
    successStories: [
      {
        title: "10 Finnish Cities Declared AFZ",
        description: "Successfully established Apartheid Free Zones in 10 Finnish municipalities",
        date: "2024-06-01",
        impact: "Reaching over 500,000 residents",
      },
    ],
    callToAction: {
      primary: "Declare Your Zone",
      secondary: "Get Resources",
      actionUrl: "/campaigns/apartheid-free-zone/register",
    },
    stats: {
      supporters: 2500,
      actions: 180,
      impact: "10 municipalities declared",
    },
  },
  {
    id: "4",
    slug: "cultural-academic-boycott",
    title: {
      en: "Cultural and Academic Boycott",
      fi: "Kulttuuri- ja akateeminen boikotti",
      ar: "المقاطعة الثقافية والأكاديمية",
    },
    shortDescription: {
      en: "Join the Palestinian-led campaign for cultural and academic boycott of Israeli institutions.",
      fi: "Liity palestiinalaisten johtamaan kulttuurin ja akateemisen boikotin kampanjaan.",
      ar: "انضم إلى الحملة التي يقودها الفلسطينيون للمقاطعة الثقافية والأكاديمية للمؤسسات الإسرائيلية.",
    },
    description: {
      en: "Join the Palestinian-led campaign for cultural and academic boycott of Israeli institutions that maintain and normalize illegal occupation, colonization, and apartheid.",
      fi: "Liity palestiinalaisten johtamaan kulttuurin ja akateemisen boikotin kampanjaan israelilaisia instituutioita vastaan, jotka ylläpitävät ja normalisoivat laitonta miehitystä, kolonisaatiota ja apartheidia.",
      ar: "انضم إلى الحملة التي يقودها الفلسطينيون للمقاطعة الثقافية والأكاديمية للمؤسسات الإسرائيلية التي تحافظ على الاحتلال غير القانوني والاستعمار والفصل العنصري وتطبيعها.",
    },
    type: "boycott",
    status: "active",
    imageUrl: "/images/campaigns/cultural-academic-boycott.jpg",
    startDate: "2024-01-15",
    targets: [
      "Israeli universities complicit in occupation",
      "Cultural events featuring Israeli state representatives",
      "Academic partnerships with complicit institutions",
    ],
    demands: [
      "End academic partnerships with complicit Israeli universities",
      "Refuse to participate in events sponsored by Israeli state",
      "Support Palestinian academic freedom",
    ],
    howToParticipate: [
      "Sign the academic boycott pledge",
      "Encourage your institution to review partnerships",
      "Attend educational workshops",
    ],
    resources: [
      {
        title: "PACBI Guidelines",
        type: "guide",
        url: "/resources/pacbi-guidelines",
        description: "Palestinian Academic and Cultural Boycott of Israel guidelines",
      },
    ],
    callToAction: {
      primary: "Sign the Pledge",
      secondary: "Learn More",
      actionUrl: "/petitions/cultural-academic-boycott",
    },
    stats: {
      supporters: 1800,
      actions: 95,
      impact: "Several partnership reviews initiated",
    },
  },
  {
    id: "5",
    slug: "israeli-products-out-of-shops",
    title: {
      en: "Israeli Products Out of Shops",
      fi: "Israelilaiset tuotteet pois kaupoista",
      ar: "المنتجات الإسرائيلية خارج المتاجر",
    },
    shortDescription: {
      en: "Campaign to remove Israeli products from Finnish stores through consumer boycotts and advocacy.",
      fi: "Kampanja israelilaisten tuotteiden poistamiseksi suomalaisista kaupoista kuluttajaboikottien ja vaikuttamisen kautta.",
      ar: "حملة لإزالة المنتجات الإسرائيلية من المتاجر الفنلندية من خلال مقاطعة المستهلكين والمناصرة.",
    },
    description: {
      en: "Campaign to remove Israeli products from Finnish stores through consumer boycotts and advocacy. Focus on removing SodaStream and Israeli dates from retail stores.",
      fi: "Kampanja israelilaisten tuotteiden poistamiseksi suomalaisista kaupoista kuluttajaboikottien ja vaikuttamisen kautta. Keskitytään SodaStreamin ja israelilaisten taatelejen poistamiseen.",
      ar: "حملة لإزالة المنتجات الإسرائيلية من المتاجر الفنلندية من خلال مقاطعة المستهلكين والمناصرة. التركيز على إزالة SodaStream والتمور الإسرائيلية من متاجر البيع بالتجزئة.",
    },
    type: "boycott",
    status: "active",
    imageUrl: "/images/campaigns/products-boycott.jpg",
    startDate: "2024-03-01",
    targets: [
      "SodaStream - Manufactured in illegal settlements",
      "Israeli dates - Often from occupied Jordan Valley",
      "Ahava cosmetics - Dead Sea products from occupied territory",
    ],
    demands: [
      "Remove Israeli settlement products from stores",
      "Clear labeling of product origins",
      "Support ethical sourcing policies",
    ],
    howToParticipate: [
      "Avoid purchasing Israeli products",
      "Request stores to remove Israeli products",
      "Distribute informational flyers",
    ],
    callToAction: {
      primary: "Get the Boycott List",
      secondary: "Report Stores",
      actionUrl: "/resources/boycott-list",
    },
    stats: {
      supporters: 2100,
      actions: 340,
      impact: "Several stores removed products",
    },
  },
  {
    id: "6",
    slug: "israel-boikottiin-euroviisuissa",
    title: {
      en: "Boycott Israel in Eurovision",
      fi: "Israel boikottiin Euroviisuissa",
      ar: "مقاطعة إسرائيل في يوروفيجن",
    },
    shortDescription: {
      en: "Join the campaign to boycott Israel's participation in Eurovision.",
      fi: "Liity kampanjaan Israelin osallistumisen boikotoimiseksi Euroviisuissa.",
      ar: "انضم إلى حملة مقاطعة مشاركة إسرائيل في يوروفيجن.",
    },
    description: {
      en: "Join the campaign to boycott Israel's participation in Eurovision. Call for Israel's exclusion from the competition due to its violations of international law and human rights.",
      fi: "Liity kampanjaan Israelin osallistumisen boikotoimiseksi Euroviisuissa. Vaadi Israelin sulkemista kilpailusta sen kansainvälisen oikeuden ja ihmisoikeuksien rikkomusten vuoksi.",
      ar: "انضم إلى حملة مقاطعة مشاركة إسرائيل في يوروفيجن. المطالبة باستبعاد إسرائيل من المسابقة بسبب انتهاكاتها للقانون الدولي وحقوق الإنسان.",
    },
    type: "awareness",
    status: "active",
    imageUrl: "/images/campaigns/eurovision-boycott.jpg",
    startDate: "2024-04-01",
    demands: [
      "Exclude Israel from Eurovision",
      "Apply EBU rules consistently",
      "Support artists who refuse to participate",
    ],
    howToParticipate: [
      "Sign the petition to EBU",
      "Contact national broadcasters",
      "Share campaign on social media",
    ],
    resources: [
      {
        title: "Eurovision Boycott FAQ",
        type: "guide",
        url: "/resources/eurovision-faq",
        description: "Common questions about the Eurovision boycott campaign",
      },
    ],
    successStories: [
      {
        title: "Massive Public Support",
        description: "Over 100,000 signatures collected across Europe",
        date: "2024-05-01",
        impact: "Unprecedented public awareness",
      },
    ],
    callToAction: {
      primary: "Sign the Petition",
      secondary: "Learn More",
      actionUrl: "/petitions/eurovision-boycott",
    },
    stats: {
      supporters: 4500,
      actions: 890,
      impact: "Growing EBU pressure",
    },
  },
];

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return campaigns.find((campaign) => campaign.slug === slug);
}

export function getRelatedCampaigns(campaignId: string, limit: number = 3): Campaign[] {
  return campaigns
    .filter((campaign) => campaign.id !== campaignId)
    .slice(0, limit);
}

export function getAllCampaigns(): Campaign[] {
  return campaigns;
}

export function getCampaignsByStatus(status: Campaign["status"]): Campaign[] {
  return campaigns.filter((campaign) => campaign.status === status);
}

export function getCampaignsByType(type: Campaign["type"]): Campaign[] {
  return campaigns.filter((campaign) => campaign.type === type);
}
