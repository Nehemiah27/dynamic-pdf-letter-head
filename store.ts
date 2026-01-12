import { AppState, Branding, WorkflowType, Quotation, Section } from './types';

const STORAGE_KEY = 'revira_nexgen_erp_db';

const INITIAL_BRANDING: Branding = {
  logo: 'https://reviranexgen.com/assets/logo-with-name.png', 
  logoBackgroundColor: '#ffffff', // Default to white for clean backgrounds
  headerImage: 'https://reviranexgen.com/assets/header.jpg',
  footerImage: 'https://reviranexgen.com/assets/footer.jpg',
  headerText: 'Blueprint of Commitment - Client Delight.',
  footerText: 'This is a computer generated document.',
  brandColor: '#2E3191', // Official Brand Blue
  registry: {
    name: 'Revira nexGen Structures Pvt. Ltd.',
    cin: 'U16222DL2025PTC459465',
    email: 'info@reviranexgen.com',
    website: 'www.reviranexgen.com',
    regionalAddress: 'Plot No. 302, 3rd Floor Rajat Residency, Nagpur',
    headOfficeAddress: '28, E2 Block, Shivram Park Nangloi Delhi - 110041',
    nagpurOffice: 'Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023',
    delhiOffice: '28, E2 Block, Shivram Park Nangloi Delhi - 110041',
    phone1: '+91 839 049 1843',
    phone2: '+91 99684 22442'
  }
};

const DEFAULT_INTRO_BODY = `We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.

Our area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.

This proposal is detailed for your ready reference and includes scope of supply, building description, design loads/criteria, material specifications, time delivery, etc complete.

We trust you will find that our proposal is in line with your requirements and we look forward to your valued order.`;

const DEFAULT_CLOSING_BODY = `We hope you’ll find our offer in line with your requirement & place your valued PO on us giving us an opportunity to serve you.

However, please feel free to contact us for any sort of additional information that you may feel is required pertaining to this offer. We assure you our best support at all times.`;

// --- SUPPLY AND FABRICATION SECTIONS ---
const createSupplyAndFabSections = (): Section[] => [
  {
    id: 'sf-1', 
    title: '1.0 SCOPE OF SUPPLY: Brief Details', 
    type: 'table', 
    headers: ['Sl. No.', 'Description', 'Details'], 
    rows: [
      ['1', 'Building Nos.', '01'], 
      ['2', 'Building Description', 'PEB Shed'], 
      ['3', 'Building built-up Area', '15494 SQF']
    ], 
    items: [], 
    content: ''
  },
  {
    id: 'sf-1b', 
    title: '1.1 Basic Building Description', 
    type: 'table', 
    headers: ['Sl. No.', 'Description', 'Details'], 
    content: '', 
    items: [],
    rows: [
      ['1', 'Frame Type', 'RF/MF'], 
      ['2', 'Length (M)', '36'], 
      ['3', 'Width (M) or Span', '21'], 
      ['4', 'Clear Height (M)', '9.0'], 
      ['5', 'Brick Wall Height (M)', '3.0'], 
      ['6', 'Side wall Column Spacing (M)', 'As Per Drawing'], 
      ['7', 'Roof Slope', '1:10'], 
      ['8', 'End Wall Column Spacing (M)', 'As Per GA'], 
      ['9', 'Bay Spacing (M)', 'As Per GA'], 
      ['10', 'Type of end frames', 'Non-Expandable Frames'], 
      ['11', 'Wind bracing', 'As per GA drawing'], 
      ['12', 'Roof cladding', 'As per GA drawing'], 
      ['13', 'Wall cladding', 'As per GA drawing'], 
      ['14', 'Openings at North wall', 'As per GA drawing'], 
      ['15', 'Openings at South wall', 'As per GA drawing'], 
      ['16', 'Openings at East wall', 'As per GA drawing'], 
      ['17', 'Openings at West wall', 'As per GA drawing'], 
      ['18', 'Curved Eaves', 'As per GA'], 
      ['19', 'Gutters', 'As per approved drawing'], 
      ['20', 'Eave Trim', 'As per approved drawing'], 
      ['21', 'Downspouts', 'As per approved drawing'], 
      ['22', 'Canopy', 'As per approved drawing'], 
      ['23', 'Partition wall', 'As per approved drawing'], 
      ['24', 'Polycarbonate skylights', 'As per GA Drawing/Specifications'], 
      ['25', 'Turbo Ventilators', 'As per GA Drawing/Specifications']
    ]
  },
  {
    id: 'sf-1c', 
    title: '1.2 Standard Building Additions (Canopy / Fascia / Liner / Partitions)', 
    type: 'table', 
    headers: ['Sr. No.', 'Description', 'PEB SHED'], 
    content: '', 
    items: [],
    rows: [
      ['1', 'Canopy - Location/', 'As per approved drawing'], 
      ['2', 'Framed openings', 'As per approved drawing']
    ]
  },
  {
    id: 'sf-2', title: '2.0 STEEL WORK FINISH', type: 'table', headers: ['No.', 'Description', 'Details'], content: '', items: [],
    rows: [
      ['1', 'Welding', 'Continuous FCAW welding along with Intermediate, AWS D1.1'],
      ['2', 'Frames, Built-up / HR sections/Bracings', 'Mechanical Cleaning with swipe blast on heavy mill scale and one coat of primer and one coat of Finish Enamel paint'],
      ['3', 'Purlins / Girts', 'ASTM A653'],
      ['4', 'Profile sheets', 'Bare-0.47 mm thk and colour -0.5 mm thk blue RAL5012']
    ]
  },
  {
    id: 'sf-3', title: '3.0 DESIGN LOADS', type: 'table', headers: ['Sr. No.', 'Description', 'PEB SHED'], content: '', items: [],
    rows: [['1', 'Dead load', '0.15 KN/M2'], ['2', 'Live load', '0.57 KN/M2'], ['3', 'Crane Capacity', '-'], ['4', 'Wind load (Kmph or m/sec)', '44 M/sec'], ['5', 'Mezzanine Load -Kg/SQM', '-'], ['6', 'Slab Thickness ( MM )', '-'], ['7', 'Seismic load (Zone no.)', 'III']]
  },
  {
    id: 'sf-4', title: '4.0 APPLICABLE CODES for Design:', type: 'list', content: '', headers: [], rows: [],
    items: [
      'Frame members are designed in accordance with AISC-LRFD (American Institute of Steel Construction).',
      'Cold Formed members are designed in accordance with the AISC For Use of Cold-Formed Light Gauge Steel Structural Member’s In General Building Construction.',
      'Deflection as per IS 800-2007.',
      'All welding is done in accordance with the 2000 Edition of the American Welding Society (AWS D1.1).',
      'Structural Welding Code-Steel. All Welders are qualified for the type of welds performed.',
      'Manufacturing dimensional tolerances are in accordance with the requirements of the 1996 Edition of the Metal Building Manufacturer Association (MBMA)of the USA.; "Low rise building systems Manual'
    ]
  },
  {
    id: 'sf-5', title: '5.0 MATERIAL SPECIFICATIONS', type: 'table', headers: ['SI. No.', 'Structural Components', 'Details', 'Codes'], content: '', items: [],
    rows: [
      ['1', 'Primary Members Built up sections (Make – SAIL/JINDAL/TATA)', 'Plates', 'Min. Y.S. 350 MPA'],
      ['2', 'Hot Rolled Sections (Make – TAT/Apollo/ SAIL)', 'Channels', 'IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA'],
      ['2b', '', 'Angles', 'IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA'],
      ['2c', '', 'Pipes', 'IS: 1161, IS: 1239 / A 572, Grade 36, Min. Y.S. 250 MPA'],
      ['3', 'Purlins/Girts (Make – JSW/TATA)', 'Hollow section', 'ASTM A653'],
      ['4', 'Anchor bolts', 'IS 2062 E250A', 'IS 2062 E250A'],
      ['5', 'Primary Connection bolts Electroplated/ Pre galvanised', 'High Strength Bolts, IS: 1367 / 8.8 Grade', 'High Strength Bolts, IS: 1367 / 8.8 Grade'],
      ['6', 'Secondary connection bolts Pre galvanised', '', 'Bolt as per ASTM A 325, Grade 4.6']
    ]
  },
  {
    id: 'sf-6', title: '6.0 DRAWINGS & DELIVERY', type: 'list', content: '', headers: [], rows: [],
    items: [
      'DNSPL will issue shop Approval Drawings within 1 week from date of signing contract/issue of Purchase Order and receipt of advance payment.',
      'BUYER must return the accepted approval drawings preferably within 1 week thereafter; otherwise, may result in revision to delivery commitment.',
      'Anchor bolts & Layout drawings for fixing anchor bolts will be provided within 10 days from the date of receipt of Advance payment.',
      'Dispatch of materials will start as per agreed time frame from the date of receipt of signed Approval drawings with receipt of payment as per agreed terms.'
    ]
  },
  {
    id: 'sf-7', title: '7.0 ERECTION - SCOPES: Scope of Client', type: 'list', content: '', headers: [], rows: [],
    items: [
      'After completion of Anchor bolt fixing, back filling of the murum up to the FFL level & rolling is under the scope of the client. Anchor bolt shall be provided to site and fixing in present our engineer at site only.',
      'Minimum 15 days curing time is to be given after Anchor Bolt Casting is done.',
      'Free Power and water to be provided close to site.',
      'If power not available, DG has to be provided.',
      'We assumed that, crane can move inside the proposed building while erecting the main frames.',
      'Security of the material is under the scope of the client.',
      'Shelter/accommodation to be provided to the workers till completion of the work.'
    ]
  },
  {
    id: 'sf-7b', title: '7.1 Scope of Company', type: 'list', content: '', headers: [], rows: [],
    items: [
      'Unloading and stacking of the material at site, Erection of material as per DNSPL specifications.',
      'Anchor Bolt Supply & Periodic Supervision is in our Scope.',
      'Alignment of columns and rafters.',
      'Plumb and checking water level of columns & Portal frame.',
      'Cleaning and touch up paint work for the structure on damaged surfaces during transportation and site movement.',
      'Alignment of Purlins and Girts.',
      'Fixing of roof sheeting, wall sheeting and accessories'
    ]
  },
  {
    id: 'sf-8', title: '8.0 COMMERCIAL PRICE', type: 'table', headers: ['S. N.', 'Description', 'UOM', 'QTY', 'Rate', 'Basic Amount Rs', 'Remarks'], 
    content: '', items: [],
    rows: [['1', 'Design, Supply, Fabrication, Painting, Profile sheets and Erection including Transportation.', 'MT', '34.75', '125000/-', '4343750/-', 'AISC Standard'], ['2.', 'Turbo ventilator with Base', 'Each', '1', '6500/-', 'Optional', '2.'], ['3.', 'Polycarbonate 2 mm thk (3.2 mtr)', 'Each', '1', '6000/-', 'Optional', '3.']]
  },
  {
    id: 'sf-8b', title: '9.0 BANK DETAILS', type: 'table', headers: ['Description', 'Details'], content: '', items: [],
    rows: [
      ['Account holder', 'REVIRA NEXGEN STRUCTURES PRIVATE LIMITED'],
      ['Bank Name', 'YES Bank'],
      ['A/C No.', '073361900002657'],
      ['IFSC Code', 'YESB0000733']
    ]
  },
  {
    id: 'sf-9', title: '10.0 COMMERCIAL TERMS & CONDITIONS', type: 'table', headers: ['Sl. No.', 'Description', 'Conditions'], content: '', items: [],
    rows: [
      ['1', 'Payment Terms including taxes', 'Supply and Erection amount:\n1. 20% advance on confirmation of order/PO/Signed contract.\n2. 40% after finalisation & submission of detailed GA drawing\n3. 30% before dispatch of material on Proforma Invoice.\n4. 5% after Structure Erection\n5. 5 % after Building Handing over'],
      ['2', 'Delivery period', 'Delivery as per mutually agreed from the date of receipt of signed approved drawings and receipt of payment as per agreed terms.'],
      ['3', 'Erection period', 'Erection Period as per mutually agreed after delivery of complete material.'],
      ['4', 'GST', 'Extra @ 18% for supply and Erection both.'],
      ['5', 'Scope of contract', 'This Contract is the only Agreement between the DNG (hereinafter referred to as SELLER) & BUYER (who has signed his acceptance on this contract) and the terms which have been Expressly stated in this Agreement will be binding including any amendments mutually agreed upon in writing.'],
      ['6', 'Proposal validity', 'This proposal is valid for (5) days from the date of this proposal. Any extension of validity must be received in writing from the SELLER.'],
      ['7', 'Erection drawing', '“DNSPL” the DNSP will furnish the BUYER with all standard erection drawings required for the erection of the buildings.'],
      ['8', 'Specification changes', 'SELLER reserve the right to modify the design of his standard buildings and to substitute material equal to or superior to that originally specified (in order to permit incorporation of changes and improvements, in the continued development of the SELLER\'s product).'],
      ['9', 'Change in scope', 'Any change and/or revision to the above stated scope of supply may lead to a variation in the price and the delivery period.'],
      ['10', 'Our liability', 'DNSPL’s liability is restricted to the scope of this contract only and it will not be responsible for acts of third parties. Consequential losses and third-party damages, if any, arising out of the delays or claims by the BUYER will not be SELLER’S responsibility'],
      ['11', 'Ownership Of Un-Approved Material at Site', 'All material supplied to site by DNSPL, which are unapproved and in excess of building requirements shall be the property of DNSPL and DNSPL reserves the right to ship the same back to its place.'],
      ['12', 'Warranty', 'Products supplied by DNSPL are warranted against any failure due to defective material & workmanship for a period of One year.'],
      ['13', 'Permits', 'The SELLER shall not be responsible or liable for the obtaining of permits to erect or install any product at BUYER’S site.'],
      ['14', 'Force Majeure', 'The SELLER shall not be liable for any loss or damage to the BUYER for the delay in delivery or cancellation of any Purchaser\'s Orders by The SELLER due to circumstances beyond The SELLER\'S control, such as but not limited to, war, riots, civil commotion, pandemic restriction by local and central government authorities, government regulations, orders, or acts of any government authority directly or indirectly interfering with or rendering more burdensome the production, transportation, delivery and erection of the products, floods, fires, delays due to transporter\'s strike and any other circumstance or event beyond SELLER\'S control.'],
      ['15', 'Weighment', 'The weight (in Kg/Tonnage) of the material shipped and mentioned in the SELLER’S “Bill of Supply” will be final and binding for all billing and payment purposes. Any variation in Kg/Tonnage at the Buyer’s end on receipt of material, will be to the Transporter’s account.'],
      ['16', 'Safety, Security and proper space at site for shipped material', 'The BUYER shall provide the SELLER a secured area for unloading and storing all material of the order. In situations where the site is in a remote location, then the BUYER shall provide the necessary Security and accommodate a secure lockable room to store small items of the order at the site.'],
      ['17', 'Exclusions', 'Anything and apart from above not mentioned in the offer.']
    ]
  }
];

// --- STRUCTURAL FABRICATION SECTIONS ---
const createStructuralFabSections = (): Section[] => [
  {
    id: 'st-1', title: 'COMMERCIAL PRICE & PAYMENT TERMS', type: 'table', headers: ['S. N.', 'Description', 'Unit', 'Quantity', 'Rate', 'Amount', 'Remarks'], 
    content: '', items: [],
    rows: [['1', 'Fabrication of Structural steel hot rolled section on job work-labour basis i.e. Pipe rack str excluding detailing.', 'Rs/MT', '600', '7440/-', '4464000/-', '']]
  },
  {
    id: 'st-1b', title: 'BANK DETAILS', type: 'table', headers: ['Description', 'Details'], content: '', items: [],
    rows: [
      ['Account holder', 'REVIRA NEXGEN STRUCTURES PRIVATE LIMITED'],
      ['Bank Name', 'YES Bank'],
      ['A/C No.', '073361900002657'],
      ['IFSC Code', 'YESB0000733']
    ]
  },
  {
    id: 'st-2', title: 'Payment Terms', type: 'list', content: 'Supply amount:', headers: [], rows: [],
    items: ['1. 15% advance on confirmation of Worder before Labour mobilization.', '2. 85% after fabrication Completion']
  },
  {
    id: 'st-3', title: 'Notes:', type: 'list', content: '', headers: [], rows: [],
    items: [
      'Above mentioned rates are quoted on the basis of inputs received and discussion.',
      'GST @ 18% Extra.',
      'Billing as per BOQ.',
      'No third-party inspection or any inspection charges bear by the Revira Nexgen.',
      'NDT test will be performed at shop only and excluding all machines, testing and consumables',
      'Closed workshop area to be provided for work by M/s Apex with fully equipped light and ventilations.',
      'All Machines, Hydra, EOT cranes, raw materials, consumables, bed material. Skids for fabrication.',
      'Detailing to be provided by M/s Apex.',
      'All shop drawing, BOQ, LOT SUMMARY to be provided by M/s Apex.'
    ]
  }
];

// --- JOB WORK SECTIONS ---
const createJobWorkSections = (): Section[] => [
  {
    id: 'jw-1', title: 'COMMERCIAL PRICE & PAYMENT TERMS', type: 'table', headers: ['S.N.', 'Description', 'Unit', 'Quantity.', 'Rate', 'Amount', 'Remarks'], 
    content: '', items: [],
    rows: [['1', 'Fabrication of Structural steel hot rolled section on job work-labour basis i.e. Pipe rack str excluding detailing.\nRs/MT 600 7440/- 4464000/-', 'Rs/MT', '600', '7440/-', '4464000/-', 'N.']]
  },
  {
    id: 'jw-1b', title: 'BANK DETAILS', type: 'table', headers: ['Description', 'Details'], content: '', items: [],
    rows: [
      ['Account holder', 'REVIRA NEXGEN STRUCTURES PRIVATE LIMITED'],
      ['Bank Name', 'YES Bank'],
      ['A/C No.', '073361900002657'],
      ['IFSC Code', 'YESB0000733']
    ]
  },
  {
    id: 'jw-2', title: 'Payment Terms', type: 'list', content: 'Supply amount:', headers: [], rows: [],
    items: ['1. 15% advance on confirmation of Worder before Labour mobilization.', '2. 85% after fabrication Completion']
  },
  {
    id: 'jw-3', title: 'Notes:', type: 'list', content: '', headers: [], rows: [],
    items: [
      'Above mentioned rates are quoted on the basis of inputs received and discussion.',
      'GST @ 18% Extra.',
      'Billing as per BOQ.',
      'No third-party inspection or any inspection charges bear by the Revira Nexgen.',
      'NDT test will be performed at shop only and excluding all machines, testing and consumables',
      'Closed workshop area to be provided for work by M/s Apex with fully equipped light and ventilations.',
      'All Machines, Hydra, EOT cranes, raw materials, consumables, bed material. Skids for fabrication.',
      'Detailing to be provided by M/s Apex.',
      'All shop drawing, BOQ, LOT SUMMARY to be provided by M/s Apex.'
    ]
  }
];

export const createSupplyAndFabricationTemplate = (projectId: string, version: number): Quotation => ({
  id: Math.random().toString(36).substr(2, 9),
  projectId,
  version,
  status: 'Draft',
  refNo: `DNSPL/2025-2026/Geeta Interior/DNG-00${version}`,
  date: '02-11-2025',
  enquiryNo: `DNSPL-GI- DNG-00${version}`,
  location: 'Madgaon (Goa)',
  subject: 'Supply & erection of Steel Structures for PEB Shed',
  salutation: 'Dear Sir,',
  introText: 'Techno-Commercial Offer',
  introBody: DEFAULT_INTRO_BODY,
  closingBody: DEFAULT_CLOSING_BODY,
  recipientName: 'Geeta Interior Madgaon (Goa)',
  recipientAddress: 'Madgaon (Goa)',
  recipientContactPerson: 'Contact Person',
  recipientPhone: '8390491843',
  recipientEmail: 'hareram.sharma@divinenexgen.com',
  priceNotes: `• Above mentioned rates are quoted on the basis of inputs received and designed accordingly.
• The above quoted rates are including transportation and excluding GST @ 18%.
• Weight may vary ±5%`,
  bankDetails: `Account holder: REVIRA NEXGEN STRUCTURES PRIVATE LIMITED
Bank Name: YES Bank
A/C No.: 073361900002657
IFSC Code: YESB0000733`,
  regardsName: 'Hareram R Sharma',
  regardsPhone: '8390491843',
  regardsEmail: 'hareram.sharma@divinenexgen.com',
  createdAt: new Date().toISOString(),
  sections: createSupplyAndFabSections()
});

export const createStructuralFabricationTemplate = (projectId: string, version: number): Quotation => ({
  ...createSupplyAndFabricationTemplate(projectId, version),
  id: Math.random().toString(36).substr(2, 9),
  sections: createStructuralFabSections()
});

export const createJobWorkTemplate = (projectId: string, version: number): Quotation => ({
  ...createSupplyAndFabricationTemplate(projectId, version),
  id: Math.random().toString(36).substr(2, 9),
  sections: createJobWorkSections()
});

const DEFAULT_DATA: AppState = {
  currentUser: null,
  users: [
    { id: '1', name: 'Hareram Sharma', email: 'admin@revira.com', role: 'Administrator' },
  ],
  clients: [
    { id: 'c1', name: 'GEETA INTERIOR', address: 'MADGAON (GOA)', gstin: '27AAAAA0000A1Z5', contactPerson: 'Contact Person', email: 'geeta@interior.com', phone: '8390491843', createdAt: new Date().toISOString() },
  ],
  projects: [
    { id: 'p1', clientId: 'c1', name: 'Goa PEB Shed Project', location: 'Madgaon (Goa)', workflow: WorkflowType.SUPPLY_AND_FABRICATION, status: 'Ongoing', createdAt: new Date().toISOString(), assignedUserId: '1' },
  ],
  quotations: [
    createSupplyAndFabricationTemplate('p1', 1)
  ],
  branding: INITIAL_BRANDING,
};

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return DEFAULT_DATA;
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};