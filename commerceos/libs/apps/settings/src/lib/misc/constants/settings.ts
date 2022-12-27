export const LEGAL_FORMS: string[] = [
  'LEGAL_FORM_AG',
  'LEGAL_FORM_EG',
  'LEGAL_FORM_EINZELUNTERN',
  'LEGAL_FORM_EK',
  'LEGAL_FORM_EV',
  'LEGAL_FORM_GBR',
  'LEGAL_FORM_GMBH',
  'LEGAL_FORM_KG',
  'LEGAL_FORM_OHG',
  'LEGAL_FORM_SONSTIGES',
  'LEGAL_FORM_UG',
];

export const BUSINESS_STATUS: string[] = [
  'REGISTERED_BUSINESS',
  'SOLO_ENTREPRENEUR',
];

export const STATUS: string[] = [
  'BUSINESS_STATUS_JUST_LOOKING',
  'BUSINESS_STATUS_HAVE_IDEA',
  'BUSINESS_STATUS_TURN_EXISTING',
  'BUSINESS_STATUS_GROWING_BUSINESS',
  'BUSINESS_STATUS_REPLACE_BUSINESS',
];

export const CURRENCIES = [
  'CHF',
  'DKK',
  'EUR',
  'GBP',
  'NOK',
  'SEK',
  'USD',
];

export const INDUSTRY_SECTORS: string[] = [
  'BRANCHE_COMPUTER_ELECTRONIC',
  'BRANCHE_SPIELWAREN',
  'BRANCHE_MUSIK',
  'BRANCHE_GESUNDEIT_PFLEGE',
  'BRANCHE_NOBLE_ACCESSORIES',
  'BRANCHE_HAUSHALTSGARATE_TECHNIK',
  'BRANCHE_MODE_TEXTILIEN',
  'BRANCHE_UHREN_SCHMUCK',
  'BRANCHE_EROTIC',
  'BRANCHE_DIGITAL_GOODS',
  'BRANCHE_SONSTIGES',
  'BRANCHE_ART_CRAFT',
  'BRANCHE_AUTOMOTIVE',
  'BRANCHE_BABY',
  'BRANCHE_CARE',
  'BRANCHE_BOOKS',
  'BRANCHE_COMPUTER',
  'BRANCHE_ELECTRONICS',
  'BRANCHE_FASHION',
  'BRANCHE_HEALTH_HOUSEHOLD',
  'BRANCHE_HOME_KITCHEN',
  'BRANCHE_LUGGAGE',
  'BRANCHE_TV',
  'BRANCHE_MUSIC',
  'BRANCHE_PET_SUPPLIES',
  'BRANCHE_SPORTS',
  'BRANCHE_TOOLS',
  'BRANCHE_TOYS',
  'BRANCHE_VIDEO_GAMES',
  'BRANCHE_OTHER',
  'BRANCHE_FINISHING_PRODUTS',
  'BRANCHE_ADDITIVE_PRODUCTS',
  'BRANCHE_DOOR_PRODUTS',
  'BRANCHE_CUTTING_TOOLS',
  'BRANCHE_FASTENERS',
  'BRANCHE_FILTRATION',
  'BRANCHE_FOOD_SUPPLIES',
  'BRANCHE_PNEUMATICS',
  'BRANCHE_ELECTRICAL',
  'BRANCHE_HARDWARE',
  'BRANCHE_HAND_TOOLS',
  'BRANCHE_JANITORIAL_SUPPLIES',
  'BRANCHE_SCIENCE_PRODUTS',
  'BRANCHE_MATERIAL_HANDLINGS',
  'BRANCHE_HEALTH',
  'BRANCHE_SHIPPING_SUPPLIES',
  'BRANCHE_POWER_TRANSMISSION',
  'BRANCHE_DENTAL_SUPPLIES',
  'BRANCHE_MEDICAL_SUPPLIES',
  'BRANCHE_RAW_MATERIALS',
  'BRANCHE_RETAIL_STORE',
  'BRANCHE_ROBOTICS',
  'BRANCHE_SCIENCE_EDUCATION',
  'BRANCHE_ADHESIVES',
  'BRANCHE_MEASURE',
  'BRANCHE_DIGITAL_MUSIC',
  'BRANCHE_DIGITAL_VIDEOS',
  'BRANCHE_SOFTWARE',
  'BRANCHE_GAMES',
  'BRANCHE_CONSULTING',
  'BRANCHE_CAR_REPAIR',
  'BRANCHE_NAIL_STUDIO',
  'BRANCHE_LOCKSMITH',
  'BRANCHE_HAIR_STYLIST',
  'BRANCHE_TOURISM',
  'BRANCHE_HOTEL',
  'BRANCHE_MOTEL',
  'BRANCHE_BED_BRAKFAST',
  'BRANCHE_RESTAURANT',
  'BRANCHE_FOOD_TRACK',
  'BRANCHE_SUPERMARKET',
  'BRANCHE_BAR',
  'BRANCHE_CAFE',
  'BRANCHE_CLUB',
];

export const PRODUCTS: string[] = [
  'BUSINESS_PRODUCT_RETAIL_B2C',
  'BUSINESS_PRODUCT_RETAIL_B2B',
  'BUSINESS_PRODUCT_GIDITAL_GOODS',
  'BUSINESS_PRODUCT_SERVICES',
  'BUSINESS_PRODUCT_OVERNIGHT_STAY',
  'BUSINESS_PRODUCT_MEALS',
  'BUSINESS_PRODUCT_FOOD',
  'BUSINESS_PRODUCT_DRINKS',
  'BUSINESS_PRODUCT_OTHERS',
];

export const EMPLOYEES: object[] = [
  { label: 'RANGE_1', min: 1, max: 5 },
  { label: 'RANGE_2', min: 6, max: 18 },
  { label: 'RANGE_3', min: 19, max: 99 },
  { label: 'RANGE_4', min: 100, max: 349 },
  { label: 'RANGE_5', min: 350, max: 1499 },
  { label: 'RANGE_6', min: 1500, max: 100000 },
];

export const SALES: object[] = [
  { label: 'RANGE_1', min: -1, max: 0 },
  { label: 'RANGE_2', min: 0, max: 5000 },
  { label: 'RANGE_3', min: 5000, max: 50000 },
  { label: 'RANGE_4', min: 50000, max: 250000 },
  { label: 'RANGE_5', min: 250000, max: 1000000 },
  { label: 'RANGE_6', min: 1000000, max: 10000000000 },
];

export const helpLinksPerLanguage: { [key: string]: string; } = {
  en: 'https://getpayever.com/contact/',
  de: 'https://payever.de/fragen/',
  es: 'https://payever.es/contactanos/',
  no: 'https://payever.no/contact/',
  da: 'https://payever.dk/contact/',
  sv: 'https://payever.se/contact/',
};

export const externalLinks: { [propName: string]: (param?: string) => string } = {
  getHelpLink: (language: string): string => (language === 'en')
    ? `https://getpayever.com/help`
    : `https://payever.${language}/help`,
  getBusinessChatLink: (language: string): string =>  {
    return helpLinksPerLanguage[language];
  },
  getWebexMeetingLink: (): string => 'https://calendly.com/payeveren',
};

export const helpLink: (arg: string) => string = (language: string) => (language === 'en')
  ? 'https://getpayever.com/help'
  : `https://payever.${language}/help`;

export const EMAIL_NOTIFICATIONS_PERIODS: string[] = [
  'never',
  'once-a-day',
  'once-a-week',
  'once-a-month',
];

export const APPS_NOTIFICATIONS_OPTIONS: string[] = [
  'never',
  'by_events',
];
