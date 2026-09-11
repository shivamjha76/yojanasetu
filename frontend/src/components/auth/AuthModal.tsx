import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();
  const { language } = useApp();
  const isHindi = language === "hi";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isRegister = authModalMode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error(isHindi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your full name.");
        }
        if (password.length < 6) {
          throw new Error(isHindi ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters.");
        }
        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          state: state || undefined,
        });
      } else {
        await login({ email: email.trim(), password });
      }
      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setState("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FEFEFD] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand & Close Button */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#1D5F49]/10 flex items-center justify-center text-[#1D5F49]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0C1924]">
                {isRegister
                  ? isHindi ? "नया नागरिक खाता बनाएं" : "Create Citizen Account"
                  : isHindi ? "नागरिक लॉग इन" : "Citizen Sign In"}
              </h3>
              <p className="text-xs text-[#525B64]">
                Scheme Sarathi • {isHindi ? "सरकारी योजना सारथी" : "Your Scheme Guide"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Login vs Register */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-gray-100 rounded-xl text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal("login");
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              !isRegister
                ? "bg-white text-[#1D5F49] font-bold shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {isHindi ? "लॉग इन" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal("register");
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              isRegister
                ? "bg-white text-[#1D5F49] font-bold shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {isHindi ? "खाता बनाएं" : "Register"}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name (Only for Register) */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {isHindi ? "पूरा नाम *" : "Full Name *"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isHindi ? "उदा. रमेश कुमार" : "e.g. Ramesh Kumar"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49] bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {isHindi ? "ईमेल पता *" : "Email Address *"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49] bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {isHindi ? "पासवर्ड *" : "Password *"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#1D5F49] focus:ring-1 focus:ring-[#1D5F49] bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isRegister && (
              <p className="text-[11px] text-gray-400">
                {isHindi ? "न्यूनतम 6 अक्षर" : "Minimum 6 characters"}
              </p>
            )}
          </div>

          {/* Optional fields for Register: State & Mobile */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  {isHindi ? "राज्य" : "State"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#1D5F49] bg-white transition-all"
                  >
                    <option value="">{isHindi ? "राज्य चुनें" : "Select State"}</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  {isHindi ? "मोबाइल (वैकल्पिक)" : "Mobile (Optional)"}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#1D5F49] bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1D5F49] hover:bg-[#174E3C] text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? "प्रक्रिया जारी है..." : "Processing..."}</span>
                </>
              ) : (
                <span>
                  {isRegister
                    ? isHindi ? "खाता बनाएं और आगे बढ़ें" : "Create Account & Continue"
                    : isHindi ? "लॉग इन करें" : "Sign In"}
                </span>
              )}
            </button>
          </div>

          {/* Switch Prompt */}
          <div className="text-center pt-2 text-xs text-gray-500">
            {isRegister ? (
              <span>
                {isHindi ? "पहले से खाता है?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="text-[#1D5F49] font-bold hover:underline"
                >
                  {isHindi ? "लॉग इन करें" : "Sign In"}
                </button>
              </span>
            ) : (
              <span>
                {isHindi ? "नया खाता बनाना चाहते हैं?" : "New to Scheme Sarathi?"}{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="text-[#1D5F49] font-bold hover:underline"
                >
                  {isHindi ? "मुफ्त खाता बनाएं" : "Create free account"}
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
