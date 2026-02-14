/**
 * Official sources for the bracket and rate data used in the calculator.
 * Used on the Tax brackets & sources page.
 */

export const FEDERAL_SOURCE = {
  name: 'IRS 2025 federal income tax rates and brackets',
  url: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets',
}

export const FICA_SOURCE = {
  name: 'IRS Publication 15 (Employer’s Tax Guide) – Social Security & Medicare',
  url: 'https://www.irs.gov/publications/p15',
}

export const STATE_STANDARD_DEDUCTIONS_SOURCE = {
  name: 'Tax Foundation – State standard deductions and brackets (2024)',
  url: 'https://taxfoundation.org/data/all/state/state-income-tax-rates-2024',
}

export const STATE_SOURCES: Record<string, { name: string; url: string }> = {
  NY: {
    name: 'New York State tax tables and rate schedule (Form IT-201)',
    url: 'https://www.tax.ny.gov/pit/file/tax-tables/2025.htm',
  },
  CA: { name: 'California FTB tax rates', url: 'https://www.ftb.ca.gov/file/personal/rates.aspx' },
  NJ: { name: 'New Jersey tax rates', url: 'https://www.nj.gov/treasury/taxation/' },
  PA: { name: 'Pennsylvania personal income tax', url: 'https://www.revenue.pa.gov/' },
  TX: { name: 'Texas (no state income tax)', url: 'https://comptroller.texas.gov/' },
  FL: { name: 'Florida (no state income tax)', url: 'https://floridarevenue.com/' },
  WA: { name: 'Washington State (capital gains only)', url: 'https://dor.wa.gov/' },
  IL: { name: 'Illinois income tax', url: 'https://tax.illinois.gov/' },
  OH: { name: 'Ohio tax', url: 'https://tax.ohio.gov/' },
  MI: { name: 'Michigan income tax', url: 'https://www.michigan.gov/treasury/' },
  MA: { name: 'Massachusetts DOR', url: 'https://www.mass.gov/dor' },
  CO: { name: 'Colorado income tax', url: 'https://tax.colorado.gov/' },
  GA: { name: 'Georgia tax', url: 'https://dor.georgia.gov/' },
  NC: { name: 'North Carolina DOR', url: 'https://www.ncdor.gov/' },
  VA: { name: 'Virginia tax', url: 'https://www.tax.virginia.gov/' },
  MD: { name: 'Maryland Comptroller', url: 'https://comptroller.maryland.gov/' },
  MN: { name: 'Minnesota revenue', url: 'https://www.revenue.state.mn.us/' },
  WI: { name: 'Wisconsin DOR', url: 'https://www.revenue.wi.gov/' },
  AZ: { name: 'Arizona DOR', url: 'https://azdor.gov/' },
  IN: { name: 'Indiana DOR', url: 'https://www.in.gov/dor/' },
  TN: { name: 'Tennessee (no state income tax)', url: 'https://www.tn.gov/revenue.html' },
  MO: { name: 'Missouri DOR', url: 'https://dor.mo.gov/' },
  CT: { name: 'Connecticut DRS', url: 'https://portal.ct.gov/drs' },
  OR: { name: 'Oregon DOR', url: 'https://www.oregon.gov/dor' },
  SC: { name: 'South Carolina DOR', url: 'https://dor.sc.gov/' },
  KY: { name: 'Kentucky DOR', url: 'https://revenue.ky.gov/' },
  AL: { name: 'Alabama DOR', url: 'https://revenue.alabama.gov/' },
  LA: { name: 'Louisiana DOR', url: 'https://revenue.louisiana.gov/' },
  OK: { name: 'Oklahoma Tax Commission', url: 'https://www.tax.ok.gov/' },
  UT: { name: 'Utah State Tax Commission', url: 'https://tax.utah.gov/' },
  IA: { name: 'Iowa DOR', url: 'https://tax.iowa.gov/' },
  NV: { name: 'Nevada (no state income tax)', url: 'https://tax.nv.gov/' },
  AR: { name: 'Arkansas DFA', url: 'https://www.dfa.arkansas.gov/' },
  MS: { name: 'Mississippi DOR', url: 'https://www.dor.ms.gov/' },
  KS: { name: 'Kansas DOR', url: 'https://www.ksrevenue.org/' },
  NM: { name: 'New Mexico Taxation & Revenue', url: 'https://www.tax.newmexico.gov/' },
  NE: { name: 'Nebraska DOR', url: 'https://revenue.nebraska.gov/' },
  WV: { name: 'West Virginia State Tax', url: 'https://tax.wv.gov/' },
  HI: { name: 'Hawaii DOTAX', url: 'https://tax.hawaii.gov/' },
  NH: { name: 'New Hampshire (no income tax on wages)', url: 'https://www.revenue.nh.gov/' },
  ME: { name: 'Maine Revenue Services', url: 'https://www.maine.gov/revenue/' },
  RI: { name: 'Rhode Island DOR', url: 'https://tax.ri.gov/' },
  MT: { name: 'Montana DOR', url: 'https://mtrevenue.gov/' },
  DE: { name: 'Delaware Division of Revenue', url: 'https://revenue.delaware.gov/' },
  SD: { name: 'South Dakota (no state income tax)', url: 'https://dlr.sd.gov/' },
  ND: { name: 'North Dakota Office of State Tax Commissioner', url: 'https://www.tax.nd.gov/' },
  AK: { name: 'Alaska (no state income tax)', url: 'https://tax.alaska.gov/' },
  VT: { name: 'Vermont DOR', url: 'https://tax.vermont.gov/' },
  WY: { name: 'Wyoming (no state income tax)', url: 'https://wyomingdepartmentofrevenue.gov/' },
  ID: { name: 'Idaho State Tax Commission', url: 'https://tax.idaho.gov/' },
  DC: { name: 'DC Office of Tax and Revenue', url: 'https://otr.cfo.dc.gov/' },
}

export const NYC_SOURCE = {
  name: 'NYC resident tax rate schedule (Form IT-201-I)',
  url: 'https://www.tax.ny.gov/forms/html-instructions/2025/it/it201i-2025.htm#nyc-tax-rate-schedule',
}

export const STATE_DISABILITY_SOURCES: Record<string, { name: string; url: string }> = {
  CA: {
    name: 'California EDD – State Disability Insurance (SDI)',
    url: 'https://edd.ca.gov/disability/contribution_rates.htm',
  },
  NJ: {
    name: 'New Jersey TDI / Family Leave – wage base and rates',
    url: 'https://www.nj.gov/labor/myleavebenefits/employer/resources/employer_tax_wage_base.shtml',
  },
}

/** Income tier labels (typical income, Top 20%, etc.) and class labels (middle class, etc.). */
export const INCOME_TIER_SOURCES = [
  {
    name: 'Census Bureau – Income and poverty in the United States',
    url: 'https://www.census.gov/library/publications/2024/demo/p60-281.html',
  },
  {
    name: 'Census Bureau – American Community Survey (median income by place/metro)',
    url: 'https://data.census.gov/',
  },
  {
    name: 'HHS – Federal poverty guidelines',
    url: 'https://aspe.hhs.gov/poverty-guidelines',
  },
  {
    name: 'Pew Research – How the American middle class has changed',
    url: 'https://www.pewresearch.org/short-reads/2022/04/20/how-the-american-middle-class-has-changed-in-nearly-five-decades/',
  },
] as const

/** “You could have bought” column: rent, car, health, groceries, retirement. */
export const YOU_COULD_HAVE_BOUGHT_SOURCES = [
  { name: 'Zillow – Rental market trends (rent by metro)', url: 'https://www.zillow.com/rental-manager/market-trends/' },
  { name: 'Apartment List – National rent report', url: 'https://www.apartmentlist.com/research/national-rent-data' },
  { name: 'Chase / industry – Average monthly car payment (new car)', url: 'https://www.chase.com/personal/auto/education/buying/average-monthly-car-payment' },
  { name: 'KFF – Health insurance premiums (ACA marketplace)', url: 'https://www.kff.org/report-section/ehbs-2024-section-1-cost-of-health-insurance/' },
  { name: 'USDA ERS – Food expenditure series (groceries)', url: 'https://www.ers.usda.gov/data-products/food-expenditure-series/' },
  { name: 'Investopedia – Average 401(k) / Roth IRA returns', url: 'https://www.investopedia.com/401-k-returns-and-how-they-compare-to-others-8779625' },
] as const
