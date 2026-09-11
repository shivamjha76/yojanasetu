import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { CitizenProfile, EligibilityResult } from "@/types/schema";
import {
  AssistedCitizen,
  AssistedCitizenInput,
  ApplicationStatus,
  CitizenApplication,
} from "@/types/operator";
import { api } from "@/services/api";
import {
  Users,
  Search,
  Plus,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Loader2,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AssistedDashboardProps {
  onSwitchToCitizenMode: () => void;
  onViewSchemeDetail?: (schemeId: string) => void;
}

const DEFAULT_NEW_PROFILE: CitizenProfile = {
  age: 35,
  gender: "male",
  state: "Rajasthan",
  district: "Jaipur",
  area_type: "rural",
  occupation: "farmer",
  category: "obc",
  annual_income: 120000,
  land_holding_acres: 2.0,
  marital_status: "married",
  is_differently_abled: false,
  ration_card_type: "bpl",
};

const STATUS_LABELS: Record<
  ApplicationStatus,
  { labelHi: string; labelEn: string; color: string; icon: any }
> = {
  documents_pending: {
    labelHi: "कागजात बाकी",
    labelEn: "Docs Pending",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Clock,
  },
  ready_to_apply: {
    labelHi: "आवेदन हेतु तैयार",
    labelEn: "Ready to Apply",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Layers,
  },
  submitted: {
    labelHi: "ऑनलाइन जमा",
    labelEn: "Submitted Online",
    color: "bg-indigo-50 text-indigo-800 border-indigo-200",
    icon: ArrowRight,
  },
  verified: {
    labelHi: "सत्यापित (तहसील)",
    labelEn: "Verified",
    color: "bg-purple-50 text-purple-800 border-purple-200",
    icon: ShieldCheck,
  },
  approved: {
    labelHi: "स्वीकृत व राशि जारी",
    labelEn: "Approved & Active",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    labelHi: "अस्वीकृत",
    labelEn: "Rejected",
    color: "bg-rose-50 text-rose-800 border-rose-200",
    icon: AlertCircle,
  },
};

export const AssistedDashboard: React.FC<AssistedDashboardProps> = ({
  onSwitchToCitizenMode,
  onViewSchemeDetail,
}) => {
  const { language } = useApp();
  const isHindi = language === "hi";

  // State
  const [citizens, setCitizens] = useState<AssistedCitizen[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSavingCitizen, setIsSavingCitizen] = useState<boolean>(false);
  const [editingCitizenId, setEditingCitizenId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    full_name: string;
    phone: string;
    village_ward: string;
    profile: CitizenProfile;
  }>({
    full_name: "",
    phone: "",
    village_ward: "",
    profile: { ...DEFAULT_NEW_PROFILE },
  });

  // Scheme Eligibility Modal State
  const [activeCitizenForSchemes, setActiveCitizenForSchemes] = useState<AssistedCitizen | null>(null);
  const [eligibleSchemes, setEligibleSchemes] = useState<EligibilityResult[]>([]);
  const [applications, setApplications] = useState<CitizenApplication[]>([]);
  const [isEvaluatingSchemes, setIsEvaluatingSchemes] = useState<boolean>(false);

  // Status Update Inline State
  const [updatingSchemeId, setUpdatingSchemeId] = useState<string | null>(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState<{
    status: ApplicationStatus;
    ref_number: string;
    notes: string;
  }>({
    status: "ready_to_apply",
    ref_number: "",
    notes: "",
  });

  // Printable Slip Modal State
  const [printSlipCitizen, setPrintSlipCitizen] = useState<{
    citizen: AssistedCitizen;
    schemes: EligibilityResult[];
    applications: CitizenApplication[];
  } | null>(null);

  // Load Citizens
  const loadCitizens = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAssistedCitizens();
      setCitizens(data);
    } catch (err) {
      console.error("Error loading citizens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCitizens();
  }, []);

  // Filtered citizens
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery)) ||
        (c.village_ward && c.village_ward.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDistrict =
        selectedDistrictFilter === "all" ||
        (c.district && c.district.toLowerCase() === selectedDistrictFilter.toLowerCase());

      return matchesSearch && matchesDistrict;
    });
  }, [citizens, searchQuery, selectedDistrictFilter]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingCitizenId(null);
    setFormData({
      full_name: "",
      phone: "",
      village_ward: "",
      profile: { ...DEFAULT_NEW_PROFILE },
    });
    setIsAddModalOpen(true);
  };

  // Handle save citizen
  const handleSaveCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    setIsSavingCitizen(true);
    try {
      const input: AssistedCitizenInput = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || undefined,
        village_ward: formData.village_ward.trim() || undefined,
        district: formData.profile.district,
        state: formData.profile.state,
        profile: formData.profile,
        operator_id: "default_operator",
      };

      if (editingCitizenId) {
        await api.updateAssistedCitizen(editingCitizenId, input);
      } else {
        await api.createAssistedCitizen(input);
      }

      await loadCitizens();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error saving citizen:", err);
    } finally {
      setIsSavingCitizen(false);
    }
  };

  // Handle delete citizen
  const handleDeleteCitizen = async (id: string, name: string) => {
    if (!window.confirm(isHindi ? `क्या आप ${name} का रिकॉर्ड हटाना चाहते हैं?` : `Delete record for ${name}?`)) {
      return;
    }
    try {
      await api.deleteAssistedCitizen(id);
      setCitizens((prev) => prev.filter((c) => c.id !== id));
      if (activeCitizenForSchemes?.id === id) {
        setActiveCitizenForSchemes(null);
      }
    } catch (err) {
      console.error("Error deleting citizen:", err);
    }
  };

  // Handle View Schemes for Citizen
  const handleViewSchemes = async (citizen: AssistedCitizen) => {
    setActiveCitizenForSchemes(citizen);
    setIsEvaluatingSchemes(true);
    try {
      const res = await api.getAssistedCitizenEligibility(citizen.id, citizen.profile_data);
      setEligibleSchemes(res.eligible_schemes || []);
      setApplications(res.applications || []);
    } catch (err) {
      console.error("Error evaluating schemes:", err);
    } finally {
      setIsEvaluatingSchemes(false);
    }
  };

  // Handle Save Status
  const handleSaveApplicationStatus = async (schemeId: string, schemeName: string, benefitAmount?: string) => {
    if (!activeCitizenForSchemes) return;

    try {
      await api.updateApplicationStatus({
        citizen_id: activeCitizenForSchemes.id,
        scheme_id: schemeId,
        scheme_name: schemeName,
        benefit_amount: benefitAmount,
        status: statusUpdateForm.status,
        ref_number: statusUpdateForm.ref_number.trim() || undefined,
        notes: statusUpdateForm.notes.trim() || undefined,
      });

      // Refresh applications for this citizen
      const res = await api.getAssistedCitizenEligibility(activeCitizenForSchemes.id);
      setApplications(res.applications || []);
      setUpdatingSchemeId(null);
      await loadCitizens();
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  // Handle open print slip
  const handleOpenPrintSlip = async (citizen: AssistedCitizen) => {
    try {
      const res = await api.getAssistedCitizenEligibility(citizen.id, citizen.profile_data);
      setPrintSlipCitizen({
        citizen,
        schemes: res.eligible_schemes || [],
        applications: res.applications || [],
      });
    } catch (err) {
      console.error("Error generating slip:", err);
    }
  };

  // Metrics calculation
  const totalCitizensCount = citizens.length;
  const availableDistricts = useMemo(() => {
    return Array.from(new Set(citizens.map((c) => c.district).filter(Boolean))) as string[];
  }, [citizens]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-24">
      {/* ======================================================== */}
      {/* Operator Top Banner & Mode Switcher                      */}
      {/* ======================================================== */}
      <div className="border-b border-border bg-card px-4 sm:px-8 py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#165D51] text-white tracking-wide">
                <Building className="w-3.5 h-3.5" />
                <span>{isHindi ? "सहायक मोड (Assisted Mode)" : "Assisted Mode"}</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                CSC VLE & NGO Field Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <span>{isHindi ? "जन सेवा केंद्र व NGO ऑपरेटर डैशबोर्ड" : "CSC Operator & Field Worker Dashboard"}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {isHindi
                ? "ग्रामीण व शहरी नागरिकों के लिए बहु-प्रोफ़ाइल पात्रता जांच, आवेदन स्थिति ट्रैकर व नागरिक पर्ची जनरेटर।"
                : "Multi-citizen demographic profiling, deterministic scheme matching, and application lifecycle tracking."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onSwitchToCitizenMode}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{isHindi ? "← सामान्य नागरिक मोड में जाएं" : "← Switch to Citizen Mode"}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#165D51] hover:bg-[#114E43] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? "+ नया नागरिक जोड़ें" : "+ Add New Citizen"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* ======================================================== */}
        {/* Metric Summary Cards                                    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{isHindi ? "पंजीकृत नागरिक" : "Saved Citizens"}</span>
              <Users className="w-4 h-4 text-[#165D51]" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {totalCitizensCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isHindi ? "ऑपरेटर द्वारा प्रबंधित प्रोफाइल" : "Profiles managed by operator"}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{isHindi ? "सत्यापित योजनाएं" : "System Schemes"}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              17
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isHindi ? "100% गणितीय रूल इंजन" : "Deterministic rule base"}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{isHindi ? "कवर किए गए जिले" : "Districts Covered"}</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {Math.max(1, availableDistricts.length)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isHindi ? "क्षेत्रीय कवरेज" : "Regional field coverage"}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{isHindi ? "नागरिक पर्ची" : "Readiness Slips"}</span>
              <Printer className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Instant
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isHindi ? "1-क्लिक प्रिंट व शेयरिंग" : "1-click print & PDF"}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Search & Filter Toolbar                                  */}
        {/* ======================================================== */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "नागरिक का नाम, फोन, या गाँव खोजें..." : "Search citizen name, phone, village..."}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-[#165D51]/20 focus:border-[#165D51] text-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {availableDistricts.length > 0 && (
              <select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#165D51]/20"
              >
                <option value="all">{isHindi ? "सभी जिले (All Districts)" : "All Districts"}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={loadCitizens}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={isHindi ? "रिफ्रेश करें" : "Refresh"}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Citizens List Table / Grid                               */}
        {/* ======================================================== */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#165D51] animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">
              {isHindi ? "नागरिकों का रिकॉर्ड लोड हो रहा है..." : "Loading citizen records..."}
            </p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#165D51]/10 text-[#165D51] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {searchQuery
                  ? isHindi
                    ? "कोई परिणाम नहीं मिला"
                    : "No matching citizens found"
                  : isHindi
                  ? "अभी तक कोई नागरिक पंजीकृत नहीं है"
                  : "No citizens added yet"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {isHindi
                  ? "नया नागरिक प्रोफ़ाइल जोड़ने के लिए ऊपर '+ नया नागरिक जोड़ें' बटन पर क्लिक करें।"
                  : "Click '+ Add New Citizen' above to register a rural or urban citizen for scheme evaluation."}
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#165D51] text-white shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? "पहला नागरिक जोड़ें" : "Add First Citizen"}</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">{isHindi ? "नागरिक का नाम व संपर्क" : "Citizen & Contact"}</th>
                    <th className="px-5 py-3.5">{isHindi ? "गाँव / वार्ड व जिला" : "Village / District"}</th>
                    <th className="px-5 py-3.5">{isHindi ? "पेशा व श्रेणी" : "Occupation & Category"}</th>
                    <th className="px-5 py-3.5">{isHindi ? "वार्षिक आय" : "Annual Income"}</th>
                    <th className="px-5 py-3.5 text-right">{isHindi ? "कार्यवाहियां (Actions)" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCitizens.map((citizen) => {
                    const prof = citizen.profile_data || {};
                    return (
                      <tr key={citizen.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              <span>{citizen.full_name}</span>
                              <span className="text-[11px] font-normal text-muted-foreground">
                                ({prof.age}y, {prof.gender})
                              </span>
                            </p>
                            {citizen.phone && (
                              <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3 text-[#165D51]" />
                                <span>{citizen.phone}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              {citizen.village_ward || prof.area_type || "—"}
                            </p>
                            <p className="text-muted-foreground text-[11px] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {citizen.district || prof.district}, {citizen.state || prof.state}
                              </span>
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
                              {prof.occupation ? prof.occupation.replace("_", " ").toUpperCase() : "—"}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                              {prof.category?.toUpperCase()} • {prof.ration_card_type?.toUpperCase()}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">
                            ₹{prof.annual_income ? prof.annual_income.toLocaleString("en-IN") : "0"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {prof.land_holding_acres ? `${prof.land_holding_acres} एकड़ भूमि` : "भूमिहीन"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => handleViewSchemes(citizen)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#165D51] hover:bg-[#114E43] text-white shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                              title={isHindi ? "योजनाएं जांचें" : "Check Schemes"}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isHindi ? "पात्रता जांचें" : "Check Schemes"}</span>
                            </button>

                            <button
                              onClick={() => handleOpenPrintSlip(citizen)}
                              className="p-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
                              title={isHindi ? "नागरिक पर्ची प्रिंट करें" : "Print Readiness Slip"}
                            >
                              <Printer className="w-4 h-4 text-blue-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteCitizen(citizen.id, citizen.full_name)}
                              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isHindi ? "हटाएं" : "Delete"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Modal 1: Add / Edit Citizen Profile                      */}
      {/* ======================================================== */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1 border-b border-border pb-4">
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#165D51] font-bold">
              <Building className="w-4 h-4" />
              <span>{isHindi ? "जन सेवा केंद्र नागरिक पंजीकरण" : "CSC Citizen Intake Form"}</span>
            </div>
            <DialogTitle className="text-xl font-extrabold text-gray-900">
              {editingCitizenId
                ? isHindi
                  ? "नागरिक प्रोफ़ाइल संपादित करें"
                  : "Edit Citizen Profile"
                : isHindi
                ? "नया नागरिक प्रोफ़ाइल पंजीकृत करें"
                : "Register New Citizen Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isHindi
                ? "नागरिक का संपर्क विवरण और जनसांख्यिकीय डेटा दर्ज करें ताकि सटीक गणितीय पात्रता निकाली जा सके।"
                : "Enter citizen details for deterministic mathematical scheme matching."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCitizen} className="space-y-5 pt-3">
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isHindi ? "पूरा नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder={isHindi ? "उदा. रामेश्वर दयाल" : "e.g. Rameshwar Dayal"}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isHindi ? "मोबाइल नंबर" : "Mobile Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isHindi ? "गाँव / वार्ड / मोहल्ला" : "Village / Ward"}
                </label>
                <input
                  type="text"
                  value={formData.village_ward}
                  onChange={(e) => setFormData({ ...formData, village_ward: e.target.value })}
                  placeholder={isHindi ? "उदा. रामपुर ग्राम" : "e.g. Rampur Village"}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165D51]/20"
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "आयु (वर्ष)" : "Age"}</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={formData.profile.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, age: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "लिंग" : "Gender"}</label>
                <select
                  value={formData.profile.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, gender: e.target.value as any },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                >
                  <option value="male">{isHindi ? "पुरुष (Male)" : "Male"}</option>
                  <option value="female">{isHindi ? "महिला (Female)" : "Female"}</option>
                  <option value="transgender">{isHindi ? "तृतीय लिंग (Transgender)" : "Transgender"}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "राज्य" : "State"}</label>
                <input
                  type="text"
                  required
                  value={formData.profile.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, state: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "जिला" : "District"}</label>
                <input
                  type="text"
                  value={formData.profile.district || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, district: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>
            </div>

            {/* Occupation, Category, Income */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "मुख्य पेशा" : "Occupation"}</label>
                <select
                  value={formData.profile.occupation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, occupation: e.target.value as any },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                >
                  <option value="farmer">किसान (Farmer)</option>
                  <option value="student">विद्यार्थी (Student)</option>
                  <option value="homemaker">गृहणी (Homemaker)</option>
                  <option value="daily_wage_laborer">दिहाड़ी मजदूर (Daily Wage)</option>
                  <option value="artisan_craftsperson">कारीगर / शिल्पकार (Artisan)</option>
                  <option value="business_self_employed">स्वरोजगार / व्यापारी (Self Employed)</option>
                  <option value="unemployed">बेरोजगार (Unemployed)</option>
                  <option value="employed_private">निजी कर्मचारी (Private)</option>
                  <option value="employed_government">सरकारी कर्मचारी (Government)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "सामाजिक श्रेणी" : "Category"}</label>
                <select
                  value={formData.profile.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, category: e.target.value as any },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                >
                  <option value="general">सामान्य (General)</option>
                  <option value="obc">ओबीसी (OBC)</option>
                  <option value="sc">अनुसूचित जाति (SC)</option>
                  <option value="st">अनुसूचित जनजाति (ST)</option>
                  <option value="ews">आर्थिक रूप से कमजोर (EWS)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isHindi ? "वार्षिक पारिवारिक आय (₹)" : "Annual Income (₹)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={formData.profile.annual_income}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        annual_income: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>
            </div>

            {/* Land & Ration Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "कृषि भूमि (एकड़)" : "Land (Acres)"}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.profile.land_holding_acres || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        land_holding_acres: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">{isHindi ? "राशन कार्ड प्रकार" : "Ration Card"}</label>
                <select
                  value={formData.profile.ration_card_type || "none"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, ration_card_type: e.target.value as any },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-900"
                >
                  <option value="none">कोई नहीं (None)</option>
                  <option value="bpl">बीपीएल (BPL)</option>
                  <option value="antyodaya">अंत्योदय (AAY)</option>
                  <option value="apl">एपीएल (APL)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_diff_abled"
                  checked={formData.profile.is_differently_abled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, is_differently_abled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#165D51] rounded cursor-pointer"
                />
                <label htmlFor="is_diff_abled" className="text-xs font-bold text-gray-700 cursor-pointer">
                  {isHindi ? "दिव्यांगजन (Divyangjan)" : "Person with Disability"}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSavingCitizen}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#165D51] hover:bg-[#114E43] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingCitizen && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isHindi ? "सुरक्षित करें (Save Citizen)" : "Save Citizen"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* Modal 2: Scheme Eligibility & Lifecycle Follow-up       */}
      {/* ======================================================== */}
      <Dialog
        open={!!activeCitizenForSchemes}
        onOpenChange={(open) => {
          if (!open) setActiveCitizenForSchemes(null);
        }}
      >
        <DialogContent className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {activeCitizenForSchemes && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-border pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isHindi ? "100% सटीक गणितीय मिलान" : "100% Deterministic Match"}</span>
                  </span>
                  <button
                    onClick={() => handleOpenPrintSlip(activeCitizenForSchemes)}
                    className="px-3 py-1 rounded-lg text-xs font-bold border border-border bg-card text-foreground hover:bg-muted flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isHindi ? "नागरिक पर्ची प्रिंट करें" : "Print Slip"}</span>
                  </button>
                </div>
                <DialogTitle className="text-xl font-extrabold text-gray-900">
                  {activeCitizenForSchemes.full_name} — {isHindi ? "पात्र सरकारी योजनाएं" : "Eligible Schemes"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  {isHindi
                    ? `${eligibleSchemes.length} योजनाएं योग्य पाई गईं। नीचे आवेदन की स्थिति और फॉलो-अप नोट्स दर्ज करें।`
                    : `${eligibleSchemes.length} schemes matched. Track application lifecycle and follow-up notes below.`}
                </DialogDescription>
              </DialogHeader>

              {isEvaluatingSchemes ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#165D51] animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">
                    {isHindi ? "रूल इंजन पात्रता की गणना कर रहा है..." : "Calculating eligibility..."}
                  </p>
                </div>
              ) : eligibleSchemes.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  {isHindi ? "इस प्रोफ़ाइल के लिए कोई सीधी पात्र योजना नहीं मिली।" : "No direct eligible schemes found."}
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleSchemes.map((res) => {
                    const currentApp = applications.find((a) => a.scheme_id === res.scheme_id);
                    const currentStatus: ApplicationStatus = currentApp?.status || "ready_to_apply";
                    const statusMeta = STATUS_LABELS[currentStatus];
                    const isEditingThis = updatingSchemeId === res.scheme_id;

                    return (
                      <div
                        key={res.scheme_id}
                        className="p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <h4
                              onClick={() => {
                                if (onViewSchemeDetail) onViewSchemeDetail(res.scheme_id);
                              }}
                              className="text-sm font-bold text-gray-900 flex items-center gap-1.5 cursor-pointer hover:text-[#165D51] transition-colors"
                            >
                              <span>{isHindi ? res.scheme_name_hi : res.scheme_name_en}</span>
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              <p className="text-xs font-extrabold text-[#165D51]">
                                {res.benefit_amount_text}
                              </p>
                              {(res.processing_time_hi || res.processing_time_en) && (
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  ⏳ {isHindi ? res.processing_time_hi : res.processing_time_en}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${statusMeta.color}`}
                            >
                              <statusMeta.icon className="w-3 h-3" />
                              <span>{isHindi ? statusMeta.labelHi : statusMeta.labelEn}</span>
                            </span>

                            {!isEditingThis && (
                              <button
                                onClick={() => {
                                  setUpdatingSchemeId(res.scheme_id);
                                  setStatusUpdateForm({
                                    status: currentStatus,
                                    ref_number: currentApp?.ref_number || "",
                                    notes: currentApp?.notes || "",
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                {isHindi ? "स्थिति बदलें" : "Update"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Existing Notes / Reference Number */}
                        {currentApp?.ref_number && (
                          <div className="text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                            <span>
                              <strong>{isHindi ? "पावती सं (Ack Ref):" : "Ack Ref:"}</strong>{" "}
                              {currentApp.ref_number}
                            </span>
                            {currentApp.notes && (
                              <span className="text-gray-500 italic truncate max-w-xs">
                                "{currentApp.notes}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Inline Update Form */}
                        {isEditingThis && (
                          <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-3 pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {isHindi ? "आवेदन की स्थिति" : "Status"}
                                </label>
                                <select
                                  value={statusUpdateForm.status}
                                  onChange={(e) =>
                                    setStatusUpdateForm({
                                      ...statusUpdateForm,
                                      status: e.target.value as ApplicationStatus,
                                    })
                                  }
                                  className="w-full p-2 rounded-lg border border-gray-200 text-xs text-gray-900"
                                >
                                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                    <option key={key} value={key}>
                                      {isHindi ? val.labelHi : val.labelEn}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {isHindi ? "आवेदन / पावती संख्या" : "Ack Ref Number"}
                                </label>
                                <input
                                  type="text"
                                  value={statusUpdateForm.ref_number}
                                  onChange={(e) =>
                                    setStatusUpdateForm({
                                      ...statusUpdateForm,
                                      ref_number: e.target.value,
                                    })
                                  }
                                  placeholder="RJ-2026-98124"
                                  className="w-full p-2 rounded-lg border border-gray-200 text-xs text-gray-900"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-700">
                                  {isHindi ? "टिप्पणी (Notes)" : "Follow-up Notes"}
                                </label>
                                <input
                                  type="text"
                                  value={statusUpdateForm.notes}
                                  onChange={(e) =>
                                    setStatusUpdateForm({
                                      ...statusUpdateForm,
                                      notes: e.target.value,
                                    })
                                  }
                                  placeholder={isHindi ? "दस्तावेज़ जमा, अगली तारीख..." : "Notes..."}
                                  className="w-full p-2 rounded-lg border border-gray-200 text-xs text-gray-900"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setUpdatingSchemeId(null)}
                                className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
                              >
                                {isHindi ? "रद्द" : "Cancel"}
                              </button>
                              <button
                                onClick={() =>
                                  handleSaveApplicationStatus(
                                    res.scheme_id,
                                    isHindi ? res.scheme_name_hi : res.scheme_name_en,
                                    res.benefit_amount_text
                                  )
                                }
                                className="px-3 py-1 text-xs font-bold rounded-lg bg-[#165D51] text-white cursor-pointer"
                              >
                                {isHindi ? "सुरक्षित करें" : "Save Status"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* Modal 3: Government Standard Printable Citizen Slip     */}
      {/* ======================================================== */}
      <Dialog
        open={!!printSlipCitizen}
        onOpenChange={(open) => {
          if (!open) setPrintSlipCitizen(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          {printSlipCitizen && (
            <div className="space-y-6 print:m-0 print:p-0">
              {/* Slip Official Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#165D51] text-white flex items-center justify-center font-bold text-sm">
                    सेतु
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                    योजनासेतु — जन सेवा केंद्र नागरिक पात्रता पर्ची
                  </h2>
                </div>
                <p className="text-[11px] text-gray-600 font-medium">
                  YojanaSetu Direct Citizen Welfare Entitlement Slip • Jan Seva Kendra / CSC Network
                </p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
                  <span>पर्ची सं: <strong>YS-CSC-{Date.now().toString().slice(-6)}</strong></span>
                  <span>दिनांक: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
                </div>
              </div>

              {/* Citizen Details Box */}
              <div className="p-3.5 rounded-xl border border-gray-300 bg-gray-50 text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">नागरिक का नाम:</span>{" "}
                    <strong className="text-gray-900">{printSlipCitizen.citizen.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">मोबाइल:</span>{" "}
                    <strong className="text-gray-900">{printSlipCitizen.citizen.phone || "उपलब्ध नहीं"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">गाँव/वार्ड:</span>{" "}
                    <strong className="text-gray-900">{printSlipCitizen.citizen.village_ward || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">जिला व राज्य:</span>{" "}
                    <strong className="text-gray-900">
                      {printSlipCitizen.citizen.district}, {printSlipCitizen.citizen.state}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Eligible Schemes List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>पात्र सरकारी योजनाएं व वित्तीय सहायता (100% Verified Schemes)</span>
                </h3>

                <div className="divide-y divide-gray-200 border border-gray-300 rounded-xl overflow-hidden text-xs">
                  {printSlipCitizen.schemes.map((s, idx) => (
                    <div key={s.scheme_id} className="p-3 flex items-center justify-between bg-white">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">
                          {idx + 1}. {s.scheme_name_hi}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {s.scheme_name_en}
                          {(s.processing_time_hi || s.processing_time_en) && (
                            <span className="text-amber-800 ml-2 font-medium">
                              • अनुमानित समय: {s.processing_time_hi || s.processing_time_en}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#165D51] text-xs">
                          {s.benefit_amount_text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents to bring */}
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs space-y-2">
                <h4 className="font-bold text-amber-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>आवश्यक दस्तावेज चेकलिस्ट (जन सेवा केंद्र लेकर आएं):</span>
                </h4>
                <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-amber-950 font-medium">
                  <li>✓ आधार कार्ड (बैंक खाते से लिंक)</li>
                  <li>✓ बैंक पासबुक की प्रति</li>
                  <li>✓ आय प्रमाण पत्र / राशन कार्ड</li>
                  <li>✓ मूल निवास प्रमाण पत्र</li>
                  <li>✓ पासपोर्ट साइज फोटो (2)</li>
                  <li>✓ जमीन के कागजात (किसानों हेतु)</li>
                </ul>
              </div>

              {/* Signature & Stamp Area */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-gray-600">
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-bold text-gray-800">नागरिक के हस्ताक्षर / अंगूठा</p>
                </div>
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-bold text-gray-800">जन सेवा केंद्र (CSC) मोहर व हस्ताक्षर</p>
                </div>
              </div>

              {/* Print Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 print:hidden">
                <button
                  onClick={() => setPrintSlipCitizen(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  {isHindi ? "बंद करें" : "Close"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#165D51] hover:bg-[#114E43] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isHindi ? "प्रिंट / PDF डाउनलोड करें" : "Print / Save PDF"}</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistedDashboard;
