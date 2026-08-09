import { useState } from "react";
import {
  Settings, Globe, CreditCard, Bell, Shield, Truck, 
  Store, Mail, Phone, MapPin, Save, Eye, EyeOff,
  ToggleLeft, ToggleRight, ChevronRight, Upload,
  Percent, Clock, AlertCircle, CheckCircle, X
} from "lucide-react";

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

// ── Toast ── 
function Toast({ msg, onClose }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-2 bg-white border border-green-100 shadow-xl rounded-xl px-4 py-3">
      <CheckCircle size={16} color="#22c55e" />
      <span className="text-sm font-semibold text-gray-700">{msg}</span>
      <button onClick={onClose} className="border-none bg-transparent cursor-pointer ml-1">
        <X size={13} color="#9ca3af" />
      </button>
    </div>
  );
}

// ── Toggle ──
function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)}
      className="cursor-pointer flex items-center"
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#22c55e" : "#e5e7eb", padding: 2, transition: "background 0.2s", position: "relative" }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        transform: value ? "translateX(20px)" : "translateX(0)",
        transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }} />
    </div>
  );
}

// ── Input Field ──
function Field({ label, value, onChange, ph, type = "text", hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={ph}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors pr-10"
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer">
            {show ? <EyeOff size={14} color="#9ca3af" /> : <Eye size={14} color="#9ca3af" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Section Card ──
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-2.5 px-3 md:px-5 py-3 md:py-4 border-b border-green-50"   style={{ background: "linear-gradient(90deg,#f0fdf4,#fff)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={GS}>
          <Icon size={14} color="#fff" />
        </div>
        <p className="text-sm font-extrabold text-gray-800 m-0">{title}</p>
      </div>
    <div className="p-3 md:p-5">{children}</div>
    </div>
  );
}

// ── Row toggle ──
function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-green-50 last:border-0  gap-3">
      
      
      
     <div className="flex-1 min-w-0">
  <p className="text-sm font-semibold text-gray-700 m-0 truncate">{label}</p>
  {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
</div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── Save Button ──
function SaveBtn({ onClick }) {
  return (
    <div className="flex justify-end mt-5">
      <button onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
        style={GS}>
        <Save size={14} /> Save Changes
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
export default function SettingsPage() {
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── General ──
  const [siteName,    setSiteName]    = useState("Three Arrow");
  const [siteEmail,   setSiteEmail]   = useState("admin@threearrow.com");
  const [sitePhone,   setSitePhone]   = useState("+92-300-1234567");
  const [siteAddress, setSiteAddress] = useState("Delhi, India");
  const [currency,    setCurrency]    = useState("Ind");
  const [timezone,    setTimezone]    = useState("Asia/Delhi");
  const [language,    setLanguage]    = useState("English");
  const [maintenance, setMaintenance] = useState(false);

  // ── Payment ──
  const [cod,          setCod]          = useState(true);
  const [onlinePayment, setOnlinePayment] = useState(true);
  const [stripe,       setStripe]       = useState(false);
  const [paypal,       setPaypal]       = useState(false);
  const [jazzcash,     setJazzcash]     = useState(true);
  const [easypaisa,    setEasypaisa]    = useState(true);
  const [taxRate,      setTaxRate]      = useState("5");
  const [minOrder,     setMinOrder]     = useState("500");
  const [freeShipping, setFreeShipping] = useState("2000");

  // ── Shipping ──
  const [flatRate,     setFlatRate]     = useState("250");
  const [expressRate,  setExpressRate]  = useState("350");
  const [freeShipOn,   setFreeShipOn]   = useState(true);
  const [internationalShip, setIntShip] = useState(false);
  const [processingTime, setProcessingTime] = useState("1-2");

  // ── Notifications ──
  const [emailOrders,   setEmailOrders]   = useState(true);
  const [emailRefunds,  setEmailRefunds]  = useState(true);
  const [emailMarketing,setEmailMark]     = useState(false);
  const [smsOrders,     setSmsOrders]     = useState(true);
  const [smsDelivery,   setSmsDelivery]   = useState(true);
  const [smsPromo,      setSmsPromo]      = useState(false);
  const [pushNotif,     setPushNotif]     = useState(true);
  const [smtpHost,      setSmtpHost]      = useState("smtp.gmail.com");
  const [smtpPort,      setSmtpPort]      = useState("587");
  const [smtpUser,      setSmtpUser]      = useState("noreply@threearrow.com");

  // ── Security ──
  const [currentPass, setCurrentPass] = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twoFA,       setTwoFA]       = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [maxLoginAttempts, setMaxLogin] = useState("5");

  // ── Store Policy ──
  const [returnDays,   setReturnDays]   = useState("7");
  const [warrantyDays, setWarrantyDays] = useState("30");
  const [autoConfirm,  setAutoConfirm]  = useState(false);
  const [autoComplete, setAutoComplete] = useState(true);
  const [reviewEnabled, setReviewEnabled] = useState(true);
  const [guestCheckout, setGuestCheckout] = useState(true);

  const TABS = [
    { key: "general",      label: "General",       Icon: Globe       },
    { key: "payment",      label: "Payment",        Icon: CreditCard  },
    { key: "shipping",     label: "Shipping",       Icon: Truck       },
    { key: "notification", label: "Notifications",  Icon: Bell        },
    { key: "security",     label: "Security",       Icon: Shield      },
    { key: "store",        label: "Store Policy",   Icon: Store       },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">Settings</h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">Manage your e-commerce platform settings</p>
        </div>
      </div>

      {/* Tab Pills */}
    {/* Tab Pills - 2 lines on mobile */}
<div className="grid grid-cols-3 md:flex gap-1.5 md:overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
  {TABS.map(tab => (
    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all
        ${activeTab === tab.key ? "text-white shadow-md shadow-green-200" : "bg-green-50 text-green-700"}`}
      style={activeTab === tab.key ? GS : {}}>
      <tab.Icon size={11} />
      <span className="truncate">{tab.label}</span>
    </button>
  ))}
</div>

      {/* ── GENERAL ── */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Site Information" icon={Globe}>
            <Field label="Site Name"    value={siteName}    onChange={setSiteName}    ph="e.g. My Store" />
            <Field label="Contact Email" value={siteEmail}  onChange={setSiteEmail}   ph="admin@store.com" />
            <Field label="Contact Phone" value={sitePhone}  onChange={setSitePhone}   ph="+92-300-0000000" />
            <Field label="Address"      value={siteAddress} onChange={setSiteAddress}  ph="City, Country" />
            <SaveBtn onClick={() => showToast("Site info saved!")} />
          </SectionCard>

          <SectionCard title="Regional Settings" icon={Settings}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400">
                {["PKR", "Ind", "EUR", "GBP", "AED", "SAR"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400">
                {["Asia/Delhi", "Asia/Agra", "Europe/London", "America/New_York", "Asia/Tokyo"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400">
                {["English", "Hindi", "Arabic", "French", "German"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <ToggleRow label="Maintenance Mode" sub="Site will show maintenance page" value={maintenance} onChange={setMaintenance} />
            <SaveBtn onClick={() => showToast("Regional settings saved!")} />
          </SectionCard>
        </div>
      )}

      {/* ── PAYMENT ── */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Payment Methods" icon={CreditCard}>
            <ToggleRow label="Cash on Delivery (COD)"    sub="Accept payment at doorstep"      value={cod}           onChange={setCod}           />
            <ToggleRow label="Online Payment"             sub="Credit/Debit card payments"      value={onlinePayment} onChange={setOnlinePayment} />
            <ToggleRow label="Stripe"                     sub="International card payments"     value={stripe}        onChange={setStripe}        />
            <ToggleRow label="PayPal"                     sub="PayPal wallet payments"          value={paypal}        onChange={setPaypal}        />
            <ToggleRow label="Phone pay"                   sub="Local mobile wallet"             value={jazzcash}      onChange={setJazzcash}      />
            <ToggleRow label="Google Pay"                  sub="Local mobile wallet"             value={easypaisa}     onChange={setEasypaisa}     />
            <SaveBtn onClick={() => showToast("Payment methods saved!")} />
          </SectionCard>

          <SectionCard title="Pricing & Tax" icon={Percent}>
            <Field label="Tax Rate (%)"              value={taxRate}      onChange={setTaxRate}      ph="e.g. 5"    hint="Applied on all orders" />
            <Field label="Minimum Order Amount (Rs)" value={minOrder}     onChange={setMinOrder}     ph="e.g. 500"  hint="Orders below this won't be accepted" />
            <Field label="Free Shipping Above (Rs)"  value={freeShipping} onChange={setFreeShipping} ph="e.g. 2000" hint="Orders above this get free shipping" />
            <SaveBtn onClick={() => showToast("Pricing settings saved!")} />
          </SectionCard>
        </div>
      )}

      {/* ── SHIPPING ── */}
      {activeTab === "shipping" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Delivery Rates" icon={Truck}>
            <Field label="Standard Delivery Rate (Rs)" value={flatRate}    onChange={setFlatRate}    ph="e.g. 150" />
            <Field label="Express Delivery Rate (Rs)"  value={expressRate} onChange={setExpressRate} ph="e.g. 300" />
            <Field label="Processing Time (days)"      value={processingTime} onChange={setProcessingTime} ph="e.g. 2-3" hint="Time before order is dispatched" />
            <ToggleRow label="Free Shipping on Large Orders" sub={`Above Rs ${freeShipping}`} value={freeShipOn} onChange={setFreeShipOn} />
            <ToggleRow label="International Shipping" sub="Deliver outside Pakistan" value={internationalShip} onChange={setIntShip} />
            <SaveBtn onClick={() => showToast("Shipping settings saved!")} />
          </SectionCard>

          <SectionCard title="Delivery Zones" icon={MapPin}>
            {[
              { city: "Delhi",   rate: "Rs 150", time: "1-2 days"  },
              { city: "Noida",    rate: "Rs 150", time: "1-2 days"  },
              { city: "Jaipur", rate: "Rs 200", time: "2-3 days"  },
              { city: "Agra",    rate: "Rs 200", time: "2-3 days"  },
              { city: "Saharanpur",  rate: "Rs 250", time: "3-4 days"  },
              { city: "Grater Noida",    rate: "Rs 300", time: "4-5 days"  },
            ].map((z, i) => (
              <div key={z.city} className="flex items-center justify-between py-2.5 border-b border-green-50 last:border-0">
                <div className="flex items-center gap-2">
                  <MapPin size={12} color="#16a34a" />
                  <span className="text-sm font-semibold text-gray-700">{z.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{z.time}</span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">{z.rate}</span>
                </div>
              </div>
            ))}
            <SaveBtn onClick={() => showToast("Delivery Zone Saved!")} />
          </SectionCard>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "notification" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <SectionCard title="Email Notifications" icon={Mail}>
              <ToggleRow label="New Order"        sub="When a new order is placed"    value={emailOrders}    onChange={setEmailOrders}    />
              <ToggleRow label="Refund Request"   sub="When refund is requested"      value={emailRefunds}   onChange={setEmailRefunds}   />
              <ToggleRow label="Marketing Emails" sub="Promotions and campaigns"      value={emailMarketing} onChange={setEmailMark}      />
            </SectionCard>

            <SectionCard title="SMS Notifications" icon={Phone}>
              <ToggleRow label="Order Confirmation" sub="SMS on new order"            value={smsOrders}   onChange={setSmsOrders}   />
              <ToggleRow label="Delivery Updates"   sub="SMS on delivery status"      value={smsDelivery} onChange={setSmsDelivery} />
              <ToggleRow label="Promotions"         sub="SMS for offers & campaigns"  value={smsPromo}    onChange={setSmsPromo}    />
            </SectionCard>

            <SectionCard title="Push Notifications" icon={Bell}>
              <ToggleRow label="Push Notifications" sub="Browser & app push alerts" value={pushNotif} onChange={setPushNotif} />
              <SaveBtn onClick={() => showToast("Notification settings saved!")} />
            </SectionCard>
          </div>

          <SectionCard title="SMTP Configuration" icon={Settings}>
            <Field label="SMTP Host"     value={smtpHost} onChange={setSmtpHost} ph="smtp.gmail.com"   hint="Your email server host" />
            <Field label="SMTP Port"     value={smtpPort} onChange={setSmtpPort} ph="587"              hint="Usually 465 or 587" />
            <Field label="SMTP Username" value={smtpUser} onChange={setSmtpUser} ph="noreply@store.com" />
            <Field label="SMTP Password" value=""         onChange={() => {}}    ph="••••••••" type="password" />
            <div className="mt-2 flex items-center gap-2 bg-blue-50 rounded-xl p-3">
              <AlertCircle size={13} color="#3b82f6" />
              <p className="text-[11px] text-blue-600 m-0">Use App Password if using Gmail 2FA</p>
            </div>
            <SaveBtn onClick={() => showToast("SMTP settings saved!")} />
          </SectionCard>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Change Password" icon={Shield}>
            <Field label="Current Password" value={currentPass} onChange={setCurrentPass} ph="Enter current password" type="password" />
            <Field label="New Password"     value={newPass}     onChange={setNewPass}     ph="Min 8 characters"        type="password" />
            <Field label="Confirm Password" value={confirmPass} onChange={setConfirmPass} ph="Repeat new password"      type="password" />
            {confirmPass && newPass !== confirmPass && (
              <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3 mb-3">
                <AlertCircle size={13} color="#ef4444" />
                <p className="text-[11px] text-red-500 m-0">Passwords do not match</p>
              </div>
            )}
            <SaveBtn onClick={() => {
              if (newPass !== confirmPass) return;
              showToast("Password changed successfully!");
              setCurrentPass(""); setNewPass(""); setConfirmPass("");
            }} />
          </SectionCard>

          <div className="flex flex-col gap-4">
            <SectionCard title="Two-Factor Authentication" icon={Shield}>
              <ToggleRow label="Enable 2FA"      sub="Adds extra login security layer"    value={twoFA}       onChange={setTwoFA}       />
              <ToggleRow label="Login Alerts"    sub="Email alert on new login"           value={loginAlerts} onChange={setLoginAlerts} />
              <ToggleRow label="IP Whitelisting" sub="Restrict login to specific IPs"     value={ipWhitelist} onChange={setIpWhitelist} />
              <SaveBtn onClick={() => showToast("Security settings saved!")} />
            </SectionCard>

            <SectionCard title="Session & Access" icon={Clock}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Session Timeout (minutes)</label>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400">
                  {["15", "30", "60", "120", "240"].map(t => <option key={t}>{t} min</option>)}
                </select>
              </div>
              <Field label="Max Login Attempts" value={maxLoginAttempts} onChange={setMaxLogin} ph="e.g. 5" hint="Account locks after this many failed attempts" />
              <SaveBtn onClick={() => showToast("Session settings saved!")} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── STORE POLICY ── */}
      {activeTab === "store" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Return & Warranty Policy" icon={Store}>
            <Field label="Return Window (days)"   value={returnDays}   onChange={setReturnDays}   ph="e.g. 7"  hint="Days allowed for product return" />
            <Field label="Warranty Period (days)" value={warrantyDays} onChange={setWarrantyDays} ph="e.g. 30" hint="Days for warranty claim" />
            <ToggleRow label="Allow Guest Checkout" sub="Users can order without account" value={guestCheckout} onChange={setGuestCheckout} />
            <ToggleRow label="Product Reviews"     sub="Allow customers to leave reviews" value={reviewEnabled} onChange={setReviewEnabled} />
            <SaveBtn onClick={() => showToast("Store policy saved!")} />
          </SectionCard>

          <SectionCard title="Order Automation" icon={Settings}>
            <ToggleRow label="Auto Confirm Orders"  sub="Auto confirm after payment"         value={autoConfirm}  onChange={setAutoConfirm}  />
            <ToggleRow label="Auto Complete Orders" sub="Mark delivered after 7 days"        value={autoComplete} onChange={setAutoComplete} />
            <div className="mt-4 bg-yellow-50 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={13} color="#f59e0b" className="shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-700 m-0">Auto-complete will mark unconfirmed deliveries as complete after the set window. Use carefully.</p>
            </div>
            <SaveBtn onClick={() => showToast("Automation settings saved!")} />
          </SectionCard>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}