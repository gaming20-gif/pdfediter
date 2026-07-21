import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  RotateCcw, 
  Save, 
  Info,
  CheckCircle,
  Menu,
  X,
  BookUser
} from 'lucide-react';
import { formatIndianCurrency, convertNumberToWords } from './utils/numberToWords';

// Indian GST State Codes mapping
const stateCodesMap = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu (Legacy)",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Legacy)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Other Country"
};

// Seeded real prominent Indian companies for demonstration / sandbox lookup
const seededGSTINs = {
  "29AACCG0527D1Z0": {
    name: "GOOGLE INDIA PRIVATE LIMITED",
    tradeName: "Google India",
    address: "No. 26/1, 4th & 5th Floor, Vaswani Centropolis, Langford Road, Shanthala Nagar, Bengaluru, Karnataka, 560025",
    stateCode: "29",
    phone: "+91 80 6721 8000",
    email: "googleindia-support@google.com"
  },
  "06AACCG0527D1Z8": {
    name: "GOOGLE INDIA PRIVATE LIMITED",
    tradeName: "Google India",
    address: "Sector 15, Part II, NH 8, Gurugram, Haryana, 122001",
    stateCode: "06",
    phone: "+91 124 451 2900",
    email: "googleindia-support@google.com"
  },
  "27AAACR4849R1ZL": {
    name: "TATA CONSULTANCY SERVICES LIMITED",
    tradeName: "TCS",
    address: "Nirmal Building, 9th Floor, Nariman Point, Mumbai, Maharashtra, 400021",
    stateCode: "27",
    phone: "+91 22 6778 9999",
    email: "tcs.investors@tcs.com"
  },
  "29AAACI4798L1ZU": {
    name: "INFOSYS LIMITED",
    tradeName: "Infosys",
    address: "Electronics City, Hosur Road, Bengaluru, Karnataka, 560100",
    stateCode: "29",
    phone: "+91 80 2852 0261",
    email: "info@infosys.com"
  },
  "29AAACW0387R6ZE": {
    name: "WIPRO LIMITED",
    tradeName: "Wipro",
    address: "Doddakannelli, Sarjapur Road, Bengaluru, Karnataka, 560035",
    stateCode: "29",
    phone: "+91 80 2844 0011",
    email: "info@wipro.com"
  }
};

const defaultSavedCompanies = [];

// Default Reference State (matching the source image exactly)
const referenceState = {
  seller: {
    name: "RAMKRISHNA WHITE CLAY",
    gstin: "24BIGPS3992C1Z4",
    address: "SURVEY NO.475/1/P1, MAMUARA, MAMUARA\nKachchh, GUJARAT, 370020",
    mobile: "+91 9909884555",
    email: "ramkrishnawhiteclay@gmail.com"
  },
  invoice: {
    title: "TAX INVOICE",
    recipientType: "ORIGINAL FOR RECIPIENT",
    num: "2026/27-56",
    date: "13 Jul 2026",
    supplyPlace: "24-GUJARAT",
    vehicleNum: "GJ12BV7888",
    dispatchAddress: "SURVEY NO 475/1/P1, MAMUARA, KACHCHH, GUJARAT\nKutch, GUJARAT, 370020"
  },
  customer: {
    name: "Bhavana Enterprises",
    subname: "BHAVANA ENTERPRISE",
    gstin: "24DCLPG2555L1ZE",
    pan: "DCLPG2555L",
    address: "House No. 492, Ground Floor, Mahesh Gamot\nJatiya vas, Mamuara\nKachchh, Gujarat, 370020",
    phone: "9274395349"
  },
  items: [
    {
      id: "1",
      name: "LAVIGATED CHINA CLAY",
      hsn: "2507",
      rate: 4700.00,
      qty: 20.22,
      qtyUnit: "MTS"
    }
  ],
  taxRate: 5,
  fontFamily: "'Inter', sans-serif",
  themeColor: "#c0942c",
  bank: {
    name: "Punjab National Bank",
    account: "07434015005855",
    ifsc: "PUNB0074310",
    branch: "BHUJ"
  },
  stampCompany: "RAMKRISHNA WHITE CLAY",
  pageNumNote: "Page 1 / 1",
  digitallySignedNote: "• This is a digitally signed document.",
  gstApiKey: "",
  enableLiveGst: false,
  savedCompanies: defaultSavedCompanies
};

export default function App() {
  // Load initial state from LocalStorage or referenceState
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('gst_invoice_react_draft');
    const baseState = { ...referenceState };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...baseState,
          ...parsed,
          seller: { ...baseState.seller, ...parsed.seller },
          customer: { ...baseState.customer, ...parsed.customer },
          invoice: { ...baseState.invoice, ...parsed.invoice },
          bank: { ...baseState.bank, ...parsed.bank },
          savedCompanies: (parsed.savedCompanies || baseState.savedCompanies).filter(
            c => c.id !== "sc-1" && c.id !== "sc-2" && c.id !== "sc-3" && c.id !== "sc-4"
          )
        };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return baseState;
  });

  const [toastMessage, setToastMessage] = useState("");
  const [manualRoundOff, setManualRoundOff] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingGST, setIsLoadingGST] = useState({ seller: false, customer: false });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('gst_invoice_react_draft', JSON.stringify(state));
  }, [state]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // State update helpers
  const updateSeller = (field, value) => {
    setState(prev => ({
      ...prev,
      seller: { ...prev.seller, [field]: value }
    }));
  };

  const updateInvoice = (field, value) => {
    setState(prev => ({
      ...prev,
      invoice: { ...prev.invoice, [field]: value }
    }));
  };

  const updateCustomer = (field, value) => {
    setState(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const [activeDropdown, setActiveDropdown] = useState(null); // 'seller' | 'customer' | null
  const [directorySearch, setDirectorySearch] = useState("");

  const saveCompanyToDirectory = (companyData, type) => {
    if (!companyData || !companyData.name || !companyData.name.trim()) return;
    
    setState(prev => {
      const existingIndex = prev.savedCompanies.findIndex(c => 
        (companyData.gstin && c.gstin && c.gstin.trim() === companyData.gstin.trim()) || 
        c.name.trim().toUpperCase() === companyData.name.trim().toUpperCase()
      );
      
      const newCompany = {
        id: existingIndex !== -1 ? prev.savedCompanies[existingIndex].id : "sc-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
        name: companyData.name.trim().toUpperCase(),
        subname: companyData.subname || companyData.tradeName || companyData.name,
        gstin: companyData.gstin || "",
        pan: companyData.pan || (companyData.gstin ? companyData.gstin.substring(2, 12) : ""),
        address: companyData.address || "",
        phone: companyData.phone || companyData.mobile || "",
        email: companyData.email || "",
        type: type
      };
      
      let updatedCompanies = [...prev.savedCompanies];
      if (existingIndex !== -1) {
        const existing = prev.savedCompanies[existingIndex];
        newCompany.type = existing.type === type ? type : "both";
        updatedCompanies[existingIndex] = newCompany;
      } else {
        updatedCompanies.push(newCompany);
      }
      
      return {
        ...prev,
        savedCompanies: updatedCompanies
      };
    });
  };

  const loadCompanyFromDirectory = (company, targetSlot) => {
    if (targetSlot === 'seller') {
      setState(prev => ({
        ...prev,
        seller: {
          ...prev.seller,
          name: company.name,
          gstin: company.gstin || "",
          address: company.address || "",
          mobile: company.phone || "",
          email: company.email || ""
        },
        invoice: {
          ...prev.invoice,
          supplyPlace: company.gstin ? `${company.gstin.substring(0, 2)}-${(stateCodesMap[company.gstin.substring(0, 2)] || "").toUpperCase()}` : prev.invoice.supplyPlace
        }
      }));
      showToast(`Loaded seller: ${company.name}`);
    } else if (targetSlot === 'customer') {
      setState(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          name: company.name,
          subname: company.subname || company.name,
          gstin: company.gstin || "",
          pan: company.pan || (company.gstin ? company.gstin.substring(2, 12) : ""),
          address: company.address || "",
          phone: company.phone || ""
        }
      }));
      showToast(`Loaded customer: ${company.name}`);
    }
  };

  const deleteCompanyFromDirectory = (companyId) => {
    setState(prev => ({
      ...prev,
      savedCompanies: prev.savedCompanies.filter(c => c.id !== companyId)
    }));
    showToast("Company removed from directory.");
  };

  const autofillFromGSTIN = async (type) => {
    const cleanGstin = (state[type]?.gstin || "").trim().toUpperCase();
    if (!cleanGstin) {
      showToast("Please enter a GSTIN first.");
      return;
    }

    // Validate GSTIN format
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    if (!gstinPattern.test(cleanGstin)) {
      showToast("Invalid GSTIN format. Enter 15-char code (e.g. 29AACCG0527D1Z0).");
      return;
    }

    setIsLoadingGST(prev => ({ ...prev, [type]: true }));

    try {
      let data = null;

      // 1. If live mode is enabled and API key is set, try fetching
      if (state.enableLiveGst && state.gstApiKey) {
        try {
          const response = await fetch("https://appyflow.in/api/verifyGST", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              gstNo: cleanGstin,
              key_secret: state.gstApiKey
            })
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          const info = result.taxpayerInfo || result;

          if (info && (info.lgnm || info.tradeNam)) {
            const parseAddress = (addr) => {
              if (!addr) return "";
              const parts = [
                addr.bno,
                addr.bnm,
                addr.st,
                addr.loc,
                addr.dst,
                addr.stcd,
                addr.pncd
              ].filter(Boolean);
              return parts.join(", ");
            };

            let formattedAddr = "";
            if (info.pradr && info.pradr.addr) {
              formattedAddr = parseAddress(info.pradr.addr);
            } else if (typeof info.pradr === 'string') {
              formattedAddr = info.pradr;
            } else if (info.adadr && info.adadr[0] && info.adadr[0].addr) {
              formattedAddr = parseAddress(info.adadr[0].addr);
            }

            data = {
              name: (info.lgnm || info.tradeNam || "Unknown Business").toUpperCase(),
              tradeName: info.tradeNam || info.lgnm || "Unknown Business",
              address: formattedAddr || info.address || "Address details not returned.",
              gstin: cleanGstin,
              stateCode: info.stcd || cleanGstin.substring(0, 2),
              phone: info.phone || "",
              email: info.email || ""
            };
          }
        } catch (apiErr) {
          console.warn("Live API request failed or was blocked by CORS. Falling back to Demo Mode.", apiErr);
          showToast("Live API failed (CORS or network error). Falling back to Demo Mode...");
        }
      }

      // 2. Fallback to seeded database / mock generator
      if (!data) {
        // Wait 800ms to simulate a network lookup for realistic UI experience
        await new Promise(resolve => setTimeout(resolve, 800));

        if (seededGSTINs[cleanGstin]) {
          data = { ...seededGSTINs[cleanGstin], gstin: cleanGstin };
        } else {
          const stateCode = cleanGstin.substring(0, 2);
          const pan = cleanGstin.substring(2, 12);
          const stateName = stateCodesMap[stateCode] || "Other State";

          // Generate realistic name based on 5th character of PAN
          const char5 = pan[4] || "A";
          const businessNames = {
            A: "Apex Solutions Ltd", B: "Blue Star Logistics", C: "Crown Metal Works", D: "Delta Digital Systems",
            E: "Empire Food Products", F: "Falcon Trade Link", G: "Galaxy Garments", H: "Horizon Chemicals",
            I: "Integrity Builders", J: "Jupiter Electronics", K: "Karnavati Papers", L: "Leo Plastics",
            M: "Matrix Consultants", N: "Nova Pharmaceuticals", O: "Oceanic Shipping", P: "Prism Paints",
            Q: "Quantum Softwares", R: "Rapid Transport Services", S: "Sunlight Agro Foods", T: "Tech Mahindra Distributors",
            U: "United Steel Industry", V: "Vanguard Retail Corp", W: "Windsors & Co", X: "Xenon Packaging",
            Y: "Yamuna Auto Spares", Z: "Zenith Heavy Machinery"
          };
          const rawName = businessNames[char5.toUpperCase()] || "Acme Enterprises Ltd";
          const businessName = `${rawName} (${stateName})`;

          const addresses = {
            "01": "Lal Chowk, Srinagar, Jammu & Kashmir, 190001",
            "02": "Mall Road, Shimla, Himachal Pradesh, 171001",
            "03": "Industrial Area Phase 7, Mohali, Punjab, 160055",
            "04": "Sector 17-C, Chandigarh, 160017",
            "05": "Haridwar Bypass Road, Dehradun, Uttarakhand, 248001",
            "06": "DLF Cyber City Phase III, Sector 24, Gurugram, Haryana, 122002",
            "07": "Connaught Place, New Delhi, Delhi, 110001",
            "08": "MI Road, Jaipur, Rajasthan, 302001",
            "09": "Noida Sector 62, Industrial Area, Uttar Pradesh, 201301",
            "10": "Patliputra Industrial Area, Patna, Bihar, 800013",
            "27": "MIDC Industrial Area, Andheri East, Mumbai, Maharashtra, 400093",
            "29": "Whitefield Industrial Area, Bengaluru, Karnataka, 560066",
            "33": "SIPCOT Industrial Park, Sriperumbudur, Tamil Nadu, 602105"
          };
          const address = addresses[stateCode] || `Plot No. 421, Phase I, Industrial Estate, ${stateName} - ${stateCode}0001`;

          data = {
            name: businessName.toUpperCase(),
            tradeName: businessName,
            address: address,
            gstin: cleanGstin,
            stateCode: stateCode,
            phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
            email: "contact@" + rawName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com"
          };
        }
      }

      // 3. Apply changes to state
      if (type === 'seller') {
        setState(prev => ({
          ...prev,
          seller: {
            ...prev.seller,
            name: data.name,
            gstin: data.gstin,
            address: data.address,
            mobile: data.phone || prev.seller.mobile,
            email: data.email || prev.seller.email
          },
          invoice: {
            ...prev.invoice,
            supplyPlace: `${data.stateCode}-${(stateCodesMap[data.stateCode] || "").toUpperCase()}`
          }
        }));
      } else {
        setState(prev => ({
          ...prev,
          customer: {
            ...prev.customer,
            name: data.name,
            subname: data.tradeName,
            gstin: data.gstin,
            pan: data.gstin.substring(2, 12),
            address: data.address,
            phone: data.phone || prev.customer.phone
          }
        }));
      }

      showToast(`Autofilled details for: ${data.name}`);
    } catch (err) {
      console.error(err);
      showToast("GSTIN lookup failed. Please try again.");
    } finally {
      setIsLoadingGST(prev => ({ ...prev, [type]: false }));
    }
  };

  const handlePrint = () => {
    const sellerGstin = (state.seller.gstin || "").trim();
    const customerGstin = (state.customer.gstin || "").trim();

    if (sellerGstin && sellerGstin.length !== 15) {
      showToast(`Seller GSTIN must be exactly 15 characters (currently: ${sellerGstin.length}).`);
      return;
    }

    if (customerGstin && customerGstin.length !== 15) {
      showToast(`Customer GSTIN must be exactly 15 characters (currently: ${customerGstin.length}).`);
      return;
    }

    saveCompanyToDirectory(state.seller, 'seller');
    saveCompanyToDirectory(state.customer, 'customer');
    window.print();
  };

  const updateBank = (field, value) => {
    setState(prev => ({
      ...prev,
      bank: { ...prev.bank, [field]: value }
    }));
  };

  const updateItem = (id, field, value) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          let val = value;
          if (field === 'rate' || field === 'qty') {
            val = parseFloat(value) || 0;
          }
          return { ...item, [field]: val };
        }
        return item;
      })
    }));
  };

  const addItemRow = () => {
    const newItem = {
      id: Date.now().toString(),
      name: "NEW ITEM DESCRIPTION",
      hsn: "2507",
      rate: 1000.00,
      qty: 1.00,
      qtyUnit: "PCS"
    };
    setState(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast("New item row added.");
  };

  const deleteItemRow = (id) => {
    if (state.items.length <= 1) {
      showToast("Invoice must contain at least one item.");
      return;
    }
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    showToast("Item row deleted.");
  };

  const resetTemplate = () => {
    if (window.confirm("Are you sure you want to reset all edits back to the default reference template?")) {
      setState(referenceState);
      setManualRoundOff(null);
      showToast("Template reset to original state.");
    }
  };

  // Computations
  const cgstRate = state.taxRate / 2;
  const sgstRate = state.taxRate / 2;

  let totalTaxableValue = 0;
  let totalCgstAmount = 0;
  let totalSgstAmount = 0;
  let totalQty = 0;
  let primaryUnit = "";

  const itemsCalculated = state.items.map(item => {
    const taxableValue = item.rate * item.qty;
    const cgstAmount = taxableValue * (cgstRate / 100);
    const sgstAmount = taxableValue * (sgstRate / 100);
    const totalAmount = taxableValue + cgstAmount + sgstAmount;

    totalTaxableValue += taxableValue;
    totalCgstAmount += cgstAmount;
    totalSgstAmount += sgstAmount;
    totalQty += item.qty;
    if (item.qtyUnit) primaryUnit = item.qtyUnit;

    return {
      ...item,
      taxableValue,
      taxAmount: cgstAmount + sgstAmount,
      totalAmount
    };
  });

  const subtotal = totalTaxableValue + totalCgstAmount + totalSgstAmount;
  const autoRoundedGrandTotal = Math.round(subtotal);
  const autoRoundOff = autoRoundedGrandTotal - subtotal;

  const currentRoundOff = manualRoundOff !== null ? parseFloat(manualRoundOff) || 0 : autoRoundOff;
  const grandTotal = manualRoundOff !== null ? subtotal + currentRoundOff : autoRoundedGrandTotal;

  // HSN Breakdown computation
  const hsnGroups = {};
  itemsCalculated.forEach(item => {
    const hsn = item.hsn || 'N/A';
    if (!hsnGroups[hsn]) {
      hsnGroups[hsn] = {
        taxable: 0,
        cgstAmt: 0,
        sgstAmt: 0,
        totalTax: 0
      };
    }
    hsnGroups[hsn].taxable += item.taxableValue;
    hsnGroups[hsn].cgstAmt += item.taxableValue * (cgstRate / 100);
    hsnGroups[hsn].sgstAmt += item.taxableValue * (sgstRate / 100);
    hsnGroups[hsn].totalTax += item.taxAmount;
  });

  return (
    <div className="flex min-h-screen text-slate-100 font-sans" style={{ '--invoice-accent': state.themeColor, fontFamily: state.fontFamily }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}

      {/* Mobile Top Header (hidden in print, hidden on md screens) */}
      <div className="md:hidden no-print fixed top-0 left-0 right-0 h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 z-40">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-sm">
            G4
          </div>
          <span className="font-bold text-slate-100 text-sm">GST React Pro</span>
        </div>

        <button
          onClick={handlePrint}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow cursor-pointer"
          title="Print"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* Backdrop Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden no-print" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Control Sidebar (Collapsible/Hidden in Print) */}
      <aside className={`no-print w-80 bg-slate-800 border-r border-slate-700 p-6 flex flex-col gap-6 fixed left-0 top-0 h-screen overflow-y-auto z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            G4
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">GST React Pro</h1>
            <p className="text-xs text-slate-400">Tailwind v4 Engine</p>
          </div>
        </div>

        {/* Style configurations */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invoice Style</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">Theme Color</label>
            <div className="flex gap-2.5 mt-1">
              {[
                { name: 'Mustard Gold', code: '#c0942c' },
                { name: 'Royal Blue', code: '#1e3a8a' },
                { name: 'Forest Green', code: '#065f46' },
                { name: 'Crimson', code: '#991b1b' },
                { name: 'Slate Charcoal', code: '#1e293b' }
              ].map(theme => (
                <button
                  key={theme.code}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-transform duration-150 ${state.themeColor === theme.code ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: theme.code }}
                  title={theme.name}
                  onClick={() => setState(p => ({ ...p, themeColor: theme.code }))}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300" htmlFor="font-select">Font Family</label>
            <select
              id="font-select"
              value={state.fontFamily}
              onChange={(e) => setState(p => ({ ...p, fontFamily: e.target.value }))}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md py-1.5 px-3 text-xs w-full outline-none focus:border-indigo-500"
            >
              <option value="'Inter', sans-serif">Inter (Clean)</option>
              <option value="'Outfit', sans-serif">Outfit (Modern)</option>
              <option value="'Playfair Display', serif">Playfair (Classic)</option>
            </select>
          </div>
        </section>

        {/* Global Taxes config */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tax Rates</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">GST Rate (%)</label>
            <input
              type="number"
              value={state.taxRate}
              min="0"
              step="0.1"
              onChange={(e) => setState(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md py-1.5 px-3 text-xs w-full outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-400">CGST ({cgstRate}%) & SGST ({sgstRate}%) split automatically</span>
          </div>
        </section>

        {/* Company Directory / Address Book */}
        <section className="flex flex-col gap-3 border-t border-slate-700 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookUser size={13} className="text-indigo-400" /> Company Directory
            </h2>
            <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">
              {state.savedCompanies.length}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {state.savedCompanies.map(company => (
              <div key={company.id} className="flex justify-between items-center bg-slate-900/50 border border-slate-700/60 p-2 rounded-md hover:border-slate-600 transition-colors gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-slate-200 truncate uppercase" title={company.name}>
                    {company.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium capitalize">
                    {company.type === 'both' ? 'Seller & Customer' : company.type}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {company.type === 'both' ? (
                    <>
                      <button
                        onClick={() => loadCompanyFromDirectory(company, 'seller')}
                        className="px-1 py-0.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded transition-colors cursor-pointer text-[9px] font-bold"
                        title="Load as Seller"
                      >
                        S+
                      </button>
                      <button
                        onClick={() => loadCompanyFromDirectory(company, 'customer')}
                        className="px-1 py-0.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded transition-colors cursor-pointer text-[9px] font-bold"
                        title="Load as Customer"
                      >
                        C+
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => loadCompanyFromDirectory(company, company.type)}
                      className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      title={`Load as ${company.type}`}
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCompanyFromDirectory(company.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    title="Delete company"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {state.savedCompanies.length === 0 && (
              <p className="text-[10px] text-slate-500 italic text-center py-4">
                No companies saved. They will be added automatically when you print or save an invoice!
              </p>
            )}
          </div>
        </section>

        {/* GST API Integration config */}
        <section className="flex flex-col gap-4 border-t border-slate-700 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">GST API Integration</h2>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Enable Live GST API</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.enableLiveGst}
                onChange={(e) => setState(p => ({ ...p, enableLiveGst: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {state.enableLiveGst && (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-slate-300" htmlFor="gst-api-key">Appyflow API Key</label>
              <input
                id="gst-api-key"
                type="password"
                value={state.gstApiKey}
                placeholder="key_secret_..."
                onChange={(e) => setState(p => ({ ...p, gstApiKey: e.target.value }))}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md py-1.5 px-3 text-[11px] w-full outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                Sign up at <a href="https://appyflow.in/verify-gst/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">appyflow.in</a> to get a free key (100 verifications/month).
              </p>
            </div>
          )}
          
          {!state.enableLiveGst && (
            <p className="text-[10px] text-slate-400 leading-normal">
              Running in <strong>Demo Mode</strong>. Seeded GSTINs for Google, TCS, Infosys, and Wipro will fetch real details. Other valid codes will generate mock details.
            </p>
          )}
        </section>

        {/* Actions panel */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</h2>
          <button
            onClick={handlePrint}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
          
          <button
            onClick={() => {
              saveCompanyToDirectory(state.seller, 'seller');
              saveCompanyToDirectory(state.customer, 'customer');
              localStorage.setItem('gst_invoice_react_draft', JSON.stringify(state));
              showToast("Draft & companies saved to directory.");
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save size={14} /> Save Draft
          </button>

          <button
            onClick={resetTemplate}
            className="w-full bg-rose-900/40 hover:bg-rose-950/60 border border-rose-800 text-rose-200 font-semibold py-2 px-4 rounded-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
          >
            <RotateCcw size={14} /> Reset Template
          </button>
        </section>

        {/* Instructions */}
        <section className="mt-auto border-t border-slate-700 pt-4 flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Info size={12} className="text-amber-500" /> Quick Help
          </h2>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Click directly on any text or table cell inside the invoice card to edit the contents!
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Changing **Rate**, **Qty**, or **HSN** in the table will trigger instant auto-calculations of totals and HSN/SAC summary.
          </p>
        </section>
      </aside>

      {/* Main Preview workspace */}
      <main className="flex-1 md:ml-80 p-4 md:p-10 pt-18 md:pt-10 flex justify-center items-start min-h-screen overflow-y-auto print:p-0 print:m-0 print:block">
        
        {/* Printable/Preview Page container */}
        <article className="print-page w-full max-w-[800px] min-h-[1130px] bg-white text-slate-900 p-4 md:p-[30px] shadow-2xl flex flex-col text-[11px] leading-tight select-text">
          <div className="print-border-black border border-slate-800 flex flex-col flex-1">
            
            {/* Invoice Header Title Area */}
            <header className="print-border-black border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center px-2.5 py-1.5 gap-2">
              <input
                type="text"
                value={state.invoice.title}
                onChange={(e) => updateInvoice('title', e.target.value)}
                className="font-bold text-[14px] text-[var(--invoice-accent)] tracking-widest text-center uppercase flex-1 md:ml-[100px] print:ml-[100px] ml-0 border border-transparent focus:border-indigo-200 rounded px-1 outline-none font-display print:hidden"
              />
              <div className="hidden print:block font-bold text-[14px] text-[var(--invoice-accent)] tracking-widest text-center uppercase flex-1 ml-[100px] font-display">
                {state.invoice.title}
              </div>

              <input
                type="text"
                value={state.invoice.recipientType}
                onChange={(e) => updateInvoice('recipientType', e.target.value)}
                className="text-[9px] font-semibold text-slate-500 uppercase border border-transparent focus:border-indigo-200 rounded px-1 outline-none text-center sm:text-right w-[150px] print:hidden"
              />
              <div className="hidden print:block text-[9px] font-semibold text-slate-500 uppercase text-right w-[150px]">
                {state.invoice.recipientType}
              </div>
            </header>

            {/* Seller Details and Metadata Grid */}
            <section className="print-border-black border-b border-slate-800 flex flex-col md:flex-row print:flex-row">
              {/* Seller details column */}
              <div className="print-border-black border-b md:border-b-0 print:border-b-0 md:border-r print:border-r border-slate-800 flex-1 p-2 flex flex-col gap-1">
                <div className="flex gap-2 items-center relative group/name w-full">
                  <input
                    type="text"
                    value={state.seller.name}
                    onChange={(e) => updateSeller('name', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.seller, 'seller')}
                    className="font-bold text-[12px] uppercase flex-1 border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                    placeholder="Seller Company Name"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown('seller');
                      setDirectorySearch("");
                    }}
                    className="no-print opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 rounded cursor-pointer transition-all"
                    title="Load from Saved Sellers"
                  >
                    <BookUser size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!state.seller.name.trim()) {
                        showToast("Please enter a Seller Company Name first.");
                        return;
                      }
                      const gstin = (state.seller.gstin || "").trim();
                      if (gstin && gstin.length !== 15) {
                        showToast(`Seller GSTIN must be exactly 15 characters (currently: ${gstin.length}).`);
                        return;
                      }
                      saveCompanyToDirectory(state.seller, 'seller');
                      showToast("Seller added to directory.");
                    }}
                    className="no-print opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 rounded cursor-pointer transition-all ml-1"
                    title="Add current Seller to Directory"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="hidden print:block font-bold text-[12px] uppercase">
                  {state.seller.name}
                </div>

                <div className="flex gap-1 items-center relative group/gst">
                  <span className="text-[9px] text-slate-500 font-medium uppercase">GSTIN:</span>
                  <input
                    type="text"
                    value={state.seller.gstin}
                    onChange={(e) => updateSeller('gstin', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.seller, 'seller')}
                    className="font-semibold w-36 border border-transparent focus:border-indigo-200 rounded outline-none print:hidden uppercase"
                    placeholder="Enter GSTIN"
                  />
                  <button
                    type="button"
                    onClick={() => autofillFromGSTIN('seller')}
                    disabled={isLoadingGST.seller}
                    className="no-print opacity-0 group-hover/gst:opacity-100 focus:opacity-100 ml-1.5 px-1.5 py-0.5 text-[8px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                    title="Autofill seller details using this GSTIN"
                  >
                    {isLoadingGST.seller ? 'Fetching...' : 'Autofill'}
                  </button>
                  <div className="hidden print:block font-semibold">
                    {state.seller.gstin}
                  </div>
                </div>

                <textarea
                  value={state.seller.address}
                  onChange={(e) => updateSeller('address', e.target.value)}
                  onBlur={() => saveCompanyToDirectory(state.seller, 'seller')}
                  rows={2}
                  className="w-full border border-transparent focus:border-indigo-200 rounded outline-none text-slate-600 text-[10px] resize-none print:hidden"
                />
                <div className="hidden print:block text-slate-600 text-[10px] whitespace-pre-line">
                  {state.seller.address}
                </div>

                <div className="flex gap-1 items-center mt-1">
                  <span className="text-[9px] text-slate-500 font-medium">Mobile:</span>
                  <input
                    type="text"
                    value={state.seller.mobile}
                    onChange={(e) => updateSeller('mobile', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.seller, 'seller')}
                    className="w-full border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                  />
                  <div className="hidden print:block">
                    {state.seller.mobile}
                  </div>
                </div>

                <div className="flex gap-1 items-center">
                  <span className="text-[9px] text-slate-500 font-medium">Email:</span>
                  <input
                    type="text"
                    value={state.seller.email}
                    onChange={(e) => updateSeller('email', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.seller, 'seller')}
                    className="w-full border border-transparent focus:border-indigo-200 rounded outline-none text-slate-600 print:hidden"
                  />
                  <div className="hidden print:block text-slate-600">
                    {state.seller.email}
                  </div>
                </div>
              </div>

              {/* Invoice Metadata columns */}
              <div className="w-full md:w-[320px] print:w-[320px] flex flex-col">
                <div className="print-border-black border-b border-slate-800 flex flex-1">
                  <div className="print-border-black border-r border-slate-800 flex-1 p-2 flex flex-col">
                    <span className="text-[9px] text-slate-500 font-medium">Invoice #:</span>
                    <input
                      type="text"
                      value={state.invoice.num}
                      onChange={(e) => updateInvoice('num', e.target.value)}
                      className="font-bold border border-transparent focus:border-indigo-200 rounded outline-none mt-0.5 print:hidden"
                    />
                    <div className="hidden print:block font-bold mt-0.5">
                      {state.invoice.num}
                    </div>
                  </div>
                  <div className="flex-1 p-2 flex flex-col">
                    <span className="text-[9px] text-slate-500 font-medium">Invoice Date:</span>
                    <input
                      type="text"
                      value={state.invoice.date}
                      onChange={(e) => updateInvoice('date', e.target.value)}
                      className="font-bold border border-transparent focus:border-indigo-200 rounded outline-none mt-0.5 print:hidden"
                    />
                    <div className="hidden print:block font-bold mt-0.5">
                      {state.invoice.date}
                    </div>
                  </div>
                </div>

                <div className="print-border-black border-b border-slate-800 p-2 flex flex-col flex-1">
                  <span className="text-[9px] text-slate-500 font-medium">Place of Supply:</span>
                  <input
                    type="text"
                    value={state.invoice.supplyPlace}
                    onChange={(e) => updateInvoice('supplyPlace', e.target.value)}
                    className="font-bold border border-transparent focus:border-indigo-200 rounded outline-none mt-0.5 print:hidden"
                  />
                  <div className="hidden print:block font-bold mt-0.5">
                    {state.invoice.supplyPlace}
                  </div>
                </div>

                <div className="print-border-black border-b border-slate-800 p-2 flex flex-col flex-1">
                  <span className="text-[9px] text-slate-500 font-medium">Vehicle number:</span>
                  <input
                    type="text"
                    value={state.invoice.vehicleNum}
                    onChange={(e) => updateInvoice('vehicleNum', e.target.value)}
                    className="font-bold border border-transparent focus:border-indigo-200 rounded outline-none mt-0.5 print:hidden"
                  />
                  <div className="hidden print:block font-bold mt-0.5">
                    {state.invoice.vehicleNum}
                  </div>
                </div>

                <div className="p-2 flex flex-col flex-1">
                  <span className="text-[9px] text-slate-500 font-medium">Dispatch From:</span>
                  <textarea
                    value={state.invoice.dispatchAddress}
                    onChange={(e) => updateInvoice('dispatchAddress', e.target.value)}
                    rows={2}
                    className="border border-transparent focus:border-indigo-200 rounded outline-none mt-0.5 text-slate-600 text-[10px] resize-none print:hidden"
                  />
                  <div className="hidden print:block text-slate-600 text-[10px] whitespace-pre-line mt-0.5">
                    {state.invoice.dispatchAddress}
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Details Section */}
            <section className="print-border-black border-b border-slate-800 p-2.5 flex flex-col gap-1">
              <span className="font-bold text-[10px] uppercase border-b border-slate-200 pb-0.5 mb-1 text-slate-600">Customer Details</span>
              
              <div className="flex gap-2 items-center relative group/name w-full">
                <input
                  type="text"
                  value={state.customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                  className="font-bold text-[12px] flex-1 border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                  placeholder="Customer Company Name"
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdown('customer');
                    setDirectorySearch("");
                  }}
                  className="no-print opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 rounded cursor-pointer transition-all"
                  title="Load from Saved Customers"
                >
                  <BookUser size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!state.customer.name.trim()) {
                      showToast("Please enter a Customer Company Name first.");
                      return;
                    }
                    const gstin = (state.customer.gstin || "").trim();
                    if (gstin && gstin.length !== 15) {
                      showToast(`Customer GSTIN must be exactly 15 characters (currently: ${gstin.length}).`);
                      return;
                    }
                    saveCompanyToDirectory(state.customer, 'customer');
                    showToast("Customer added to directory.");
                  }}
                  className="no-print opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 rounded cursor-pointer transition-all ml-1"
                  title="Add current Customer to Directory"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="hidden print:block font-bold text-[12px]">
                {state.customer.name}
              </div>

              <input
                type="text"
                value={state.customer.subname}
                onChange={(e) => updateCustomer('subname', e.target.value)}
                onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                className="font-semibold text-slate-600 uppercase border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
              />
              <div className="hidden print:block font-semibold text-slate-600 uppercase">
                {state.customer.subname}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-0.5">
                <div className="flex gap-1 items-center relative group/gst">
                  <span className="text-[9px] text-slate-500 font-medium uppercase">GSTIN:</span>
                  <input
                    type="text"
                    value={state.customer.gstin}
                    onChange={(e) => updateCustomer('gstin', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                    className="font-semibold w-36 border border-transparent focus:border-indigo-200 rounded outline-none print:hidden uppercase"
                    placeholder="Enter GSTIN"
                  />
                  <button
                    type="button"
                    onClick={() => autofillFromGSTIN('customer')}
                    disabled={isLoadingGST.customer}
                    className="no-print opacity-0 group-hover/gst:opacity-100 focus:opacity-100 ml-1.5 px-1.5 py-0.5 text-[8px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                    title="Autofill customer details using this GSTIN"
                  >
                    {isLoadingGST.customer ? 'Fetching...' : 'Autofill'}
                  </button>
                  <div className="hidden print:block font-semibold">
                    {state.customer.gstin}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-[9px] text-slate-500 font-medium uppercase">PAN:</span>
                  <input
                    type="text"
                    value={state.customer.pan}
                    onChange={(e) => updateCustomer('pan', e.target.value)}
                    onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                    className="font-semibold border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                  />
                  <div className="hidden print:block font-semibold">
                    {state.customer.pan}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                <span className="text-[9px] text-slate-500 font-medium">Billing Address:</span>
                <textarea
                  value={state.customer.address}
                  onChange={(e) => updateCustomer('address', e.target.value)}
                  onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                  rows={2}
                  className="w-full border border-transparent focus:border-indigo-200 rounded outline-none text-slate-600 text-[10px] resize-none print:hidden"
                />
                <div className="hidden print:block text-slate-600 text-[10px] whitespace-pre-line">
                  {state.customer.address}
                </div>
              </div>
              <div className="flex gap-1 items-center mt-1">
                <span className="text-[9px] text-slate-500 font-medium">Ph:</span>
                <input
                  type="text"
                  value={state.customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  onBlur={() => saveCompanyToDirectory(state.customer, 'customer')}
                  className="border border-transparent focus:border-indigo-200 rounded outline-none text-slate-700 print:hidden"
                />
                <div className="hidden print:block text-slate-700">
                  {state.customer.phone}
                </div>
              </div>
            </section>

            {/* Items Table container */}
            <section className="flex-1 flex flex-col">
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-[10px] table-fixed min-w-[750px] md:min-w-0 print:min-w-0">
                  <thead>
                    <tr className="print-bg-white bg-slate-50 font-semibold print-border-black border-b border-slate-800">
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-center w-[5%]">#</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-left w-[43%]">Item</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-center w-[10%]">HSN/SAC</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-right w-[12%]">Rate / Item</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-center w-[12%]">Qty</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-right w-[12%]">Taxable Value</th>
                      <th className="print-border-black border-r border-slate-800 p-1.5 text-right w-[12%]">Tax Amount</th>
                      <th className="p-1.5 text-right w-[12%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsCalculated.map((item, idx) => (
                      <tr key={item.id} className="group relative print-border-black border-b border-slate-800">
                        <td className="print-border-black border-r border-slate-800 p-1.5 text-center align-top">
                          <div>{idx + 1}</div>
                          <button
                            onClick={() => deleteItemRow(item.id)}
                            className="no-print md:hidden mt-1.5 mx-auto w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center shadow-sm hover:bg-rose-700 cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      <td className="print-border-black border-r border-slate-800 p-1 align-top text-left">
                        <textarea
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          rows={1}
                          className="w-full border border-transparent focus:border-indigo-200 rounded outline-none resize-none align-top overflow-hidden print:hidden"
                        />
                        <div className="hidden print:block text-left align-top whitespace-pre-line p-0.5">
                          {item.name}
                        </div>
                      </td>
                      <td className="print-border-black border-r border-slate-800 p-1 align-top text-center">
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                          className="w-full text-center border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                        />
                        <div className="hidden print:block text-center p-0.5">
                          {item.hsn}
                        </div>
                      </td>
                      <td className="print-border-black border-r border-slate-800 p-1 align-top text-right font-mono">
                        <input
                          type="text"
                          defaultValue={formatIndianCurrency(item.rate)}
                          onBlur={(e) => {
                            let val = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                            updateItem(item.id, 'rate', val);
                            e.target.value = formatIndianCurrency(val);
                          }}
                          className="w-full text-right border border-transparent focus:border-indigo-200 rounded outline-none font-mono print:hidden"
                        />
                        <div className="hidden print:block text-right font-mono p-0.5">
                          {formatIndianCurrency(item.rate)}
                        </div>
                      </td>
                      <td className="print-border-black border-r border-slate-800 p-1 align-top text-center font-mono">
                        <div className="flex items-center gap-1 justify-center print:hidden">
                          <input
                            type="number"
                            value={item.qty}
                            step="0.01"
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                            className="w-10 text-center border border-transparent focus:border-indigo-200 rounded outline-none font-mono"
                          />
                          <input
                            type="text"
                            value={item.qtyUnit}
                            onChange={(e) => updateItem(item.id, 'qtyUnit', e.target.value)}
                            className="w-8 text-center text-[8px] text-slate-500 font-semibold border border-transparent focus:border-indigo-200 rounded outline-none"
                          />
                        </div>
                        <div className="hidden print:block text-center font-mono p-0.5">
                          {item.qty.toFixed(2)} {item.qtyUnit}
                        </div>
                      </td>
                      <td className="print-border-black border-r border-slate-800 p-1.5 align-top text-right font-mono">
                        {formatIndianCurrency(item.taxableValue)}
                      </td>
                      <td className="print-border-black border-r border-slate-800 p-1.5 align-top text-right font-mono">
                        {formatIndianCurrency(item.taxAmount)}
                      </td>
                      <td className="p-1.5 align-top text-right font-mono font-semibold">
                        {formatIndianCurrency(item.totalAmount)}
                      </td>

                      {/* Row Delete button overlay (hidden in print) */}
                      <td className="no-print absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:block">
                        <button
                          onClick={() => deleteItemRow(item.id)}
                          className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Add item button under the table */}
              <div className="no-print p-2 flex justify-start">
                <button
                  onClick={addItemRow}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-semibold py-1 px-2.5 rounded border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus size={10} /> Add Item Row
                </button>
              </div>
            </section>

            {/* Total Item count and Qty summaries footer bar */}
            <section className="print-border-black border-b border-slate-800 px-2.5 py-1 bg-slate-50 print-bg-white font-semibold flex">
              <span>Total items / Qty : </span>
              <span className="ml-1 font-bold">
                {itemsCalculated.length} / {totalQty.toFixed(2)} {primaryUnit}
              </span>
            </section>

            {/* Calculations and Summary grid block */}
            <section className="print-border-black border-b border-slate-800 flex flex-col md:flex-row print:flex-row">
              {/* Total amount in words (Left) */}
              <div className="print-border-black border-b md:border-b-0 print:border-b-0 md:border-r print:border-r border-slate-800 flex-[1.3] p-2 flex flex-col">
                <span className="text-[9px] text-slate-500 font-medium">Total amount (in words):</span>
                <span className="font-semibold text-slate-800 italic leading-relaxed mt-1">
                  {convertNumberToWords(grandTotal)}
                </span>
              </div>

              {/* Calculations tally side (Right) */}
              <div className="w-full md:w-[300px] print:w-[300px] flex flex-col">
                <div className="flex justify-between px-2.5 py-1 text-[9px] text-slate-500 font-medium border-b border-slate-100 border-dashed">
                  <span>Taxable Amount</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{formatIndianCurrency(totalTaxableValue)}</span>
                </div>
                <div className="flex justify-between px-2.5 py-1 text-[9px] text-slate-500 font-medium border-b border-slate-100 border-dashed">
                  <span>CGST {cgstRate}%</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{formatIndianCurrency(totalCgstAmount)}</span>
                </div>
                <div className="flex justify-between px-2.5 py-1 text-[9px] text-slate-500 font-medium border-b border-slate-100 border-dashed">
                  <span>SGST {sgstRate}%</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{formatIndianCurrency(totalSgstAmount)}</span>
                </div>
                <div className="flex justify-between px-2.5 py-1 items-center text-[9px] text-slate-500 font-medium border-b border-slate-200">
                  <span>Round Off</span>
                  <span className="font-mono flex items-center">
                    <input
                      type="text"
                      value={currentRoundOff.toFixed(2)}
                      onChange={(e) => setManualRoundOff(e.target.value)}
                      onBlur={() => {
                        if (manualRoundOff !== null) {
                          const parsed = parseFloat(manualRoundOff);
                          if (isNaN(parsed)) {
                            setManualRoundOff(null);
                          } else {
                            setManualRoundOff(parsed.toFixed(2));
                          }
                        }
                      }}
                      className="w-12 text-right border border-transparent focus:border-indigo-200 rounded outline-none font-semibold text-slate-900 print:hidden"
                    />
                    <div className="hidden print:block text-right font-mono font-semibold text-slate-900">
                      {currentRoundOff.toFixed(2)}
                    </div>
                  </span>
                </div>
                <div className="print-bg-white print-border-black border-t border-slate-800 bg-slate-50 flex justify-between px-2.5 py-2 text-[12px] font-bold text-slate-900">
                  <span>Total</span>
                  <span className="font-mono text-[13px] font-extrabold">₹{formatIndianCurrency(grandTotal)}</span>
                </div>
              </div>
            </section>

            {/* HSN Breakdown Tax Breakdown summary */}
            <section className="print-border-black border-b border-slate-800 flex flex-col">
              <div className="print-bg-white print-border-black border-b border-slate-800 px-2.5 py-1 text-[9px] font-bold text-slate-700 bg-slate-50">
                GST Tax Breakdown (HSN/SAC Summary)
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-[9px] table-fixed min-w-[600px] md:min-w-0 print:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-200 print-border-black">
                      <th rowSpan="2" className="print-border-black border-r border-slate-800 p-1 text-center w-[15%]">HSN/SAC</th>
                      <th rowSpan="2" className="print-border-black border-r border-slate-800 p-1 text-right w-[20%]">Taxable Value</th>
                      <th colSpan="2" className="print-border-black border-r border-slate-800 p-1 text-center w-[25%] border-b border-slate-200 print-border-black">Central Tax</th>
                      <th colSpan="2" className="print-border-black border-r border-slate-800 p-1 text-center w-[25%] border-b border-slate-200 print-border-black">State/UT Tax</th>
                      <th rowSpan="2" className="p-1 text-right w-[15%]">Total Tax Amount</th>
                    </tr>
                    <tr className="border-b border-slate-200 print-border-black">
                      <th className="print-border-black border-r border-slate-800 p-1 text-center">Rate</th>
                      <th className="print-border-black border-r border-slate-800 p-1 text-right">Amount</th>
                      <th className="print-border-black border-r border-slate-800 p-1 text-center">Rate</th>
                      <th className="print-border-black border-r border-slate-800 p-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(hsnGroups).map(hsn => {
                      const group = hsnGroups[hsn];
                      return (
                        <tr key={hsn} className="border-b border-slate-200 print-border-black font-mono">
                          <td className="print-border-black border-r border-slate-800 p-1 text-center">{hsn}</td>
                          <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(group.taxable)}</td>
                          <td className="print-border-black border-r border-slate-800 p-1 text-center">{cgstRate}%</td>
                          <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(group.cgstAmt)}</td>
                          <td className="print-border-black border-r border-slate-800 p-1 text-center">{sgstRate}%</td>
                          <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(group.sgstAmt)}</td>
                          <td className="p-1 text-right">{formatIndianCurrency(group.totalTax)}</td>
                        </tr>
                      );
                    })}
                    
                    {/* HSN Breakdown Total Row */}
                    <tr className="print-bg-white bg-slate-50 font-bold font-mono">
                      <td className="print-border-black border-r border-slate-800 p-1 text-center">TOTAL</td>
                      <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(totalTaxableValue)}</td>
                      <td className="print-border-black border-r border-slate-800 p-1 text-center">-</td>
                      <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(totalCgstAmount)}</td>
                      <td className="print-border-black border-r border-slate-800 p-1 text-center">-</td>
                      <td className="print-border-black border-r border-slate-800 p-1 text-right">{formatIndianCurrency(totalSgstAmount)}</td>
                      <td className="p-1 text-right">{formatIndianCurrency(totalCgstAmount + totalSgstAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* HSN Summary Amount Payable Summary Bar */}
            <section className="print-bg-white bg-slate-50 px-2.5 py-1 font-bold flex justify-end text-[10px] print-border-black border-b border-slate-800">
              <span className="text-slate-600 mr-1.5 font-medium">Amount Payable:</span>
              <span className="font-extrabold text-slate-900 font-mono">₹{formatIndianCurrency(grandTotal)}</span>
            </section>

            {/* Bottom details section (Bank details & stamp signature) */}
            <section className="flex flex-col md:flex-row print:flex-row flex-1 min-h-[120px]">
              {/* Bank info (Left) */}
              <div className="print-border-black md:border-r print:border-r border-slate-800 flex-[1.2] p-2.5 flex flex-col gap-1">
                <span className="font-bold text-[9px] uppercase text-slate-600 border-b border-slate-200 pb-0.5 mb-1 w-full">Bank Details:</span>
                <table className="w-full text-[10px]">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 text-[9px] uppercase font-medium w-[70px] py-0.5">Bank:</td>
                      <td>
                        <input
                          type="text"
                          value={state.bank.name}
                          onChange={(e) => updateBank('name', e.target.value)}
                          className="font-semibold w-full border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                        />
                        <div className="hidden print:block font-semibold">
                          {state.bank.name}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 text-[9px] uppercase font-medium py-0.5">Account #:</td>
                      <td>
                        <input
                          type="text"
                          value={state.bank.account}
                          onChange={(e) => updateBank('account', e.target.value)}
                          className="font-semibold w-full border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                        />
                        <div className="hidden print:block font-semibold">
                          {state.bank.account}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 text-[9px] uppercase font-medium py-0.5">IFSC Code:</td>
                      <td>
                        <input
                          type="text"
                          value={state.bank.ifsc}
                          onChange={(e) => updateBank('ifsc', e.target.value)}
                          className="font-semibold w-full border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                        />
                        <div className="hidden print:block font-semibold">
                          {state.bank.ifsc}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 text-[9px] uppercase font-medium py-0.5">Branch:</td>
                      <td>
                        <input
                          type="text"
                          value={state.bank.branch}
                          onChange={(e) => updateBank('branch', e.target.value)}
                          className="font-semibold w-full border border-transparent focus:border-indigo-200 rounded outline-none print:hidden"
                        />
                        <div className="hidden print:block font-semibold">
                          {state.bank.branch}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature stamp info (Right) */}
              <div className="print-border-black border-t md:border-t-0 print:border-t-0 border-slate-800 flex-1 p-2.5 flex flex-col justify-between items-center relative min-h-[120px] md:min-h-0">
                <div className="text-[9px] font-medium text-slate-500 text-left w-full flex gap-1">
                  <span>For</span>
                  <input
                    type="text"
                    value={state.stampCompany}
                    onChange={(e) => setState(p => ({ ...p, stampCompany: e.target.value }))}
                    className="font-bold text-slate-900 border border-transparent focus:border-indigo-200 rounded outline-none uppercase w-full print:hidden"
                  />
                  <div className="hidden print:block font-bold text-slate-900 uppercase w-full">
                    {state.stampCompany}
                  </div>
                </div>
                
                {/* Stamp graphic container */}
                <div className="w-full flex justify-center items-center h-[70px] relative">
                  <div className="print-stamp absolute w-[75px] h-[75px] opacity-85 pointer-events-none -rotate-6">
                    <svg className="w-full h-full text-blue-700" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                      <path d="M22 55 C 32 38, 42 42, 49 51 C 56 60, 68 28, 78 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <text x="50" y="24" fontFamily="'Outfit', sans-serif" fontSize="6.5" fontWeight="800" fill="currentColor" textAnchor="middle" letterSpacing="1">VERIFIED</text>
                      <text x="50" y="82" fontFamily="'Outfit', sans-serif" fontSize="6.5" fontWeight="800" fill="currentColor" textAnchor="middle" letterSpacing="1">VERIFIED</text>
                    </svg>
                  </div>
                </div>

                <div className="font-bold text-[9px] text-center w-full">
                  Authorized Signatory
                </div>
              </div>
            </section>
          </div>

          {/* Invoice footer pagination and digital sign stamp note */}
          <footer className="flex justify-between items-center pt-2.5 text-[9px] text-slate-500">
            <input
              type="text"
              value={state.pageNumNote}
              onChange={(e) => setState(p => ({ ...p, pageNumNote: e.target.value }))}
              className="border border-transparent focus:border-indigo-200 rounded outline-none w-20 print:hidden"
            />
            <div className="hidden print:block w-20">
              {state.pageNumNote}
            </div>

            <input
              type="text"
              value={state.digitallySignedNote}
              onChange={(e) => setState(p => ({ ...p, digitallySignedNote: e.target.value }))}
              className="border border-transparent focus:border-indigo-200 rounded outline-none flex-1 text-right print:hidden"
            />
            <div className="hidden print:block flex-1 text-right">
              {state.digitallySignedNote}
            </div>
          </footer>
        </article>
      </main>

      {/* Saved Companies Lookup Modal */}
      {activeDropdown && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-850">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Select {activeDropdown === 'seller' ? 'Seller' : 'Customer'}
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Choose a company from your directory</p>
              </div>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  setDirectorySearch("");
                }}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-slate-700 bg-slate-900/50">
              <input
                type="text"
                placeholder="Search by name, GSTIN, or address..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                autoFocus
              />
            </div>

            {/* Modal Content - List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[40vh]">
              {state.savedCompanies
                .filter(company => {
                  if (activeDropdown === 'seller') {
                    if (company.type !== 'seller' && company.type !== 'both') return false;
                  } else {
                    if (company.type !== 'customer' && company.type !== 'both') return false;
                  }
                  
                  const q = directorySearch.toLowerCase();
                  return (
                    company.name.toLowerCase().includes(q) ||
                    (company.gstin && company.gstin.toLowerCase().includes(q)) ||
                    (company.address && company.address.toLowerCase().includes(q))
                  );
                })
                .map(company => (
                  <button
                    key={company.id}
                    onClick={() => {
                      loadCompanyFromDirectory(company, activeDropdown);
                      setActiveDropdown(null);
                      setDirectorySearch("");
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-700/50 flex flex-col gap-1 cursor-pointer transition-colors group border border-transparent hover:border-slate-700"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-200 text-xs group-hover:text-indigo-400 transition-colors uppercase">
                        {company.name}
                      </span>
                      {company.gstin && (
                        <span className="text-[9px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-medium">
                          {company.gstin}
                        </span>
                      )}
                    </div>
                    {company.subname && company.subname !== company.name && (
                      <span className="text-[10px] text-slate-400 italic">Trade: {company.subname}</span>
                    )}
                    <span className="text-[10px] text-slate-400 line-clamp-1">{company.address}</span>
                  </button>
                ))}

              {state.savedCompanies.filter(company => {
                if (activeDropdown === 'seller') {
                  return company.type === 'seller' || company.type === 'both';
                }
                return company.type === 'customer' || company.type === 'both';
              }).length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No saved {activeDropdown === 'seller' ? 'sellers' : 'customers'} found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
