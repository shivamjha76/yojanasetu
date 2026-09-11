import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

interface LoginPageProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess = () => {},
  onBackToHome = () => {},
}) => {
  const { login, register } = useAuth();
  const { language } = useApp();
  const isHindi = language === "hi";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error(isHindi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.");
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
      // On successful login or registration, redirect to wizard
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FEFEFD] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Home button */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#525B64] hover:text-[#1D5F49] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{isHindi ? "मुख्य पृष्ठ पर वापस जाएं" : "Back to Home"}</span>
        </button>

        {/* Brand Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="flex justify-center select-none">
            <img
              src="/images/logo_exact_transparent.png"
              alt="Scheme Sarathi"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0C1924]">
            {isRegister
              ? isHindi ? "नया नागरिक खाता बनाएं" : "Create Citizen Account"
              : isHindi ? "नागरिक लॉग इन" : "Sign In to Your Account"}
          </h2>
          <p className="text-xs sm:text-sm text-[#525B64] max-w-sm mx-auto">
            {isHindi
              ? "सरकारी योजनाओं की खोज और पात्रता जांचने के लिए आगे बढ़ें।"
              : "Discover government schemes and check your eligibility."}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-black/5 rounded-2xl border border-gray-100">
          {/* Tab Selector: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl text-sm font-medium mb-6">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("login");
              }}
              className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
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
                setMode("register");
              }}
              className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
                isRegister
                  ? "bg-white text-[#1D5F49] font-bold shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isHindi ? "खाता बनाएं" : "Register"}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Register */}
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

            {/* Email */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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

            {/* State & Phone for Register */}
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
                    {isHindi ? "मोबाइल (वैकल्पिक)" : "Mobile"}
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
            <div className="pt-2">
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
                      ? isHindi ? "खाता बनाएं और पात्रता जांचें" : "Create Account & Check Eligibility"
                      : isHindi ? "लॉग इन करें और आगे बढ़ें" : "Sign In & Continue"}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Switch helper */}
          <div className="text-center pt-5 border-t border-gray-100 mt-5 text-xs text-gray-500">
            {isRegister ? (
              <span>
                {isHindi ? "पहले से खाता है?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="text-[#1D5F49] font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? "लॉग इन करें" : "Sign In"}
                </button>
              </span>
            ) : (
              <span>
                {isHindi ? "नया खाता बनाना चाहते हैं?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("register");
                  }}
                  className="text-[#1D5F49] font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? "मुफ्त खाता बनाएं" : "Create free account"}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
