import React, { useState, useEffect } from 'react';
import { Mail, Lock, Phone, MapPin, User, Camera, ShieldCheck, FileText, ChevronRight, LogOut, AlertCircle, Eye, EyeOff, X, KeyRound, CheckCircle2, LogIn } from 'lucide-react';
import { resizeImageFile, safeSetItem } from '../utils/storage';
import Toast from '../components/Toast';

export default function Profile({ onNavigate }) {
  const [viewState, setViewState] = useState('login'); // 'login', 'signup', 'profile', 'guest'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup Form States
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Show/Hide Password States for Signup
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState({});

  // Agreement Checkboxes & Modals
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Active Logged-in User State
  const [currentUser, setCurrentUser] = useState(null);

  // Confirmation / Success Popups
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit Profile flow
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditPasswordConfirm, setShowEditPasswordConfirm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [editPasswordError, setEditPasswordError] = useState('');
  const [showEditPasswordVisible, setShowEditPasswordVisible] = useState(false);

  // Toast (success feedback matched sa buong app)
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2500);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('sawrap_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setViewState('profile');
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImageFile(file, 500, 0.8)
        .then((resized) => setAvatarPreview(resized))
        .catch(() => setErrors((prev) => ({ ...prev, avatar: 'Failed to process image. Please try another photo.' })));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      newErrors.fullName = 'Name should contain letters only.';
    }

    if (!signupEmail.trim()) {
      newErrors.signupEmail = 'Email is required.';
    } else if (!signupEmail.toLowerCase().endsWith('@gmail.com')) {
      newErrors.signupEmail = 'Email must end with @gmail.com';
    }

    if (!signupPassword) {
      newErrors.signupPassword = 'Password is required.';
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (signupPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !cleanPhone.startsWith('9')) {
      newErrors.phone = 'Enter valid 10-digit number starting with 9.';
    }

    if (!location.trim()) {
      newErrors.location = 'Location/Address is required.';
    }

    if (!agreedTerms || !agreedPrivacy) {
      newErrors.agreements = 'You must agree to both terms and privacy policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Ipakita muna ang confirmation popup bago talaga gawin ang account
    setShowSignupConfirm(true);
  };

  const confirmCreateAccount = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const newUser = {
      name: fullName.trim(),
      email: signupEmail.trim(),
      phone: `+63 ${cleanPhone}`,
      location: location.trim(),
      avatar: avatarPreview,
      password: signupPassword, // Demo-only: hindi pa naka-hash, dapat palitan ng totoong auth sa backend
      createdAt: new Date().toLocaleDateString(),
    };

    safeSetItem('sawrap_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setShowSignupConfirm(false);
    setShowSignupSuccess(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    const savedUser = localStorage.getItem('sawrap_user');
    let userObj = null;

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === loginEmail) {
        userObj = parsed;
      }
    }

    // Kung walang nakasaving user o bagong email ang inilagay, gawa na lang ng session para hindi maabala ang demo
    if (!userObj) {
      userObj = {
        name: loginEmail.split('@')[0],
        email: loginEmail,
        phone: '+63 9399030522',
        location: 'Manila, Philippines',
        avatar: null,
        password: loginPassword, // Demo-only
      };
      safeSetItem('sawrap_user', JSON.stringify(userObj));
    }

    setCurrentUser(userObj);
    setViewState('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('sawrap_user');
    setCurrentUser(null);
    setViewState('login');
    setShowLogoutConfirm(false);
  };

  // ===== EDIT PROFILE FLOW =====
  const handleOpenEditModal = () => {
    setEditName(currentUser?.name || '');
    setEditPhone((currentUser?.phone || '').replace(/[^0-9]/g, '').slice(-10));
    setEditEmail(currentUser?.email || '');
    setEditLocation(currentUser?.location || '');
    setEditAvatar(currentUser?.avatar || null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImageFile(file, 500, 0.8)
        .then((resized) => setEditAvatar(resized))
        .catch(() => setEditErrors((prev) => ({ ...prev, avatar: 'Failed to process image.' })));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editName.trim()) newErrors.name = 'Full Name is required.';
    else if (!/^[a-zA-Z\s]+$/.test(editName)) newErrors.name = 'Name should contain letters only.';

    if (!editEmail.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!editEmail.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Email must end with @gmail.com';
    }

    if (!editPhone || editPhone.length !== 10 || !editPhone.startsWith('9')) {
      newErrors.phone = 'Enter valid 10-digit number starting with 9.';
    }
    if (!editLocation.trim()) newErrors.location = 'Location/Address is required.';

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEditClick = () => {
    if (!validateEditForm()) return;
    // Bago i-apply, kailangan munang i-confirm ng password (para hindi basta-basta
    // mapalitan ang info kahit sinong makahawak ng bukas na session)
    setEditPasswordInput('');
    setEditPasswordError('');
    setShowEditModal(false);
    setShowEditPasswordConfirm(true);
  };

  const handleConfirmEditSave = (e) => {
    e.preventDefault();
    try {
      if (!editPasswordInput) {
        setEditPasswordError('Please enter your password.');
        return;
      }
      if (currentUser?.password && editPasswordInput !== currentUser.password) {
        setEditPasswordError('Incorrect password. Please try again.');
        return;
      }

      const updatedUser = {
        ...currentUser,
        name: editName.trim(),
        email: editEmail.trim(),
        phone: `+63 ${editPhone}`,
        location: editLocation.trim(),
        avatar: editAvatar,
      };
      safeSetItem('sawrap_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setShowEditPasswordConfirm(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      setEditPasswordError('Something went wrong while saving. Please try again.');
    }
  };

  // 1. SIGN UP VIEW
  if (viewState === 'signup') {
    return (
      <div className="mx-auto max-w-sm py-2 space-y-4 text-center font-sans">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Sign up</h1>

        <form onSubmit={handleSignUpSubmit} className="space-y-3">
          <div className="relative mx-auto h-24 w-24 mb-2">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 shadow-inner border border-gray-200 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile Preview" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-amber-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-amber-400 text-white shadow-md hover:bg-amber-500 transition-all">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Full Name (Letters only)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
            {errors.fullName && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.signupEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="email"
                placeholder="Enter e-mail (example@gmail.com)"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
            {errors.signupEmail && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.signupEmail}</p>}
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.signupPassword ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showSignupPassword ? 'text' : 'password'}
                placeholder="Enter password (min 6 characters)"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
              >
                {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.signupPassword && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.signupPassword}</p>}
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-600 mr-2 border-r border-gray-300 pr-2">+63</span>
              <input
                type="text"
                maxLength={10}
                placeholder="9XXXXXXXXX (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <div className={`flex items-center rounded-2xl bg-gray-100 px-4 py-3 border transition-all ${
              errors.location ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
            }`}>
              <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter Location / Delivery Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
            {errors.location && <p className="text-[10px] text-red-500 font-bold text-left px-3 mt-1">{errors.location}</p>}
          </div>

          <div className="space-y-1.5 pt-1 text-left">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-[11px] text-gray-600">
                I agree to the{' '}
                <button type="button" onClick={() => setShowTermsModal(true)} className="font-bold text-amber-500 underline cursor-pointer">
                  User Agreement Form
                </button>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-[11px] text-gray-600">
                I agree to the{' '}
                <button type="button" onClick={() => setShowPrivacyModal(true)} className="font-bold text-amber-500 underline cursor-pointer">
                  Data Privacy Policy
                </button>
              </span>
            </label>

            {errors.agreements && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.agreements}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-400 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all mt-2 cursor-pointer"
          >
            Sign up
          </button>
        </form>

        <p className="text-xs text-gray-500 font-medium pt-1">
          Already have an account?{' '}
          <button onClick={() => setViewState('login')} className="font-bold text-amber-500 hover:underline cursor-pointer">
            Login
          </button>
        </p>

        {/* SIGNUP CONFIRMATION MODAL - bago talaga gawin ang account */}
        {showSignupConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-800">Create this account?</h3>
                <p className="text-xs text-gray-500">
                  Gagawin ang account para kay <span className="font-bold text-gray-700">{fullName}</span> ({signupEmail}). Sigurado ka na ba sa mga detalyeng inilagay?
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowSignupConfirm(false)}
                  className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  Review Again
                </button>
                <button
                  onClick={confirmCreateAccount}
                  className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
                >
                  Yes, Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIGNUP SUCCESS MODAL */}
        {showSignupSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-800">Account Created!</h3>
                <p className="text-xs text-gray-500">Welcome to SaWrap, {fullName.split(' ')[0]}! Handa ka nang mag-order.</p>
              </div>
              <button
                onClick={() => { setShowSignupSuccess(false); setViewState('profile'); }}
                className="w-full rounded-2xl bg-amber-400 py-3 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 text-left space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" /> User Agreement
                </h3>
                <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
              </div>
              <div className="text-xs text-gray-600 max-h-60 overflow-y-auto space-y-2 leading-relaxed">
                <p>Welcome to SaWrap! By creating an account, you agree to comply with our store policies.</p>
              </div>
              <button onClick={() => { setAgreedTerms(true); setShowTermsModal(false); }} className="w-full bg-amber-400 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-500 cursor-pointer">
                Accept & Close
              </button>
            </div>
          </div>
        )}

        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 text-left space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" /> Data Privacy Form
                </h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
              </div>
              <div className="text-xs text-gray-600 max-h-60 overflow-y-auto space-y-2 leading-relaxed">
                <p>SaWrap respects your personal data. We collect your email and phone number solely for orders.</p>
              </div>
              <button onClick={() => { setAgreedPrivacy(true); setShowPrivacyModal(false); }} className="w-full bg-amber-400 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-500 cursor-pointer">
                Accept & Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. LOGIN VIEW (Walang na ngang alert popup, inline error message na lang)
  if (viewState === 'login') {
    return (
      <div className="mx-auto max-w-sm py-4 space-y-6 text-center font-sans">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">hello, guest!</h1>

        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 shadow-inner border border-gray-100">
          <User className="h-14 w-14 text-amber-400" />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-3">
          <div className="flex items-center rounded-2xl bg-gray-100 px-4 py-3 border border-gray-200/80 focus-within:border-amber-400 transition-all">
            <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex items-center rounded-2xl bg-gray-100 px-4 py-3 border border-gray-200/80 focus-within:border-amber-400 transition-all">
            <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type={showLoginPassword ? 'text' : 'password'}
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
            >
              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {loginError && (
            <p className="text-[11px] text-red-500 font-bold px-1 text-left">{loginError}</p>
          )}

          <div className="text-right">
            <a href="#forgot" className="text-[11px] font-semibold text-red-400 hover:underline">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-400 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all cursor-pointer"
          >
            Login
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-bold text-gray-400 uppercase">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={() => setViewState('guest')}
          className="w-full rounded-2xl border-2 border-amber-400 py-2.5 text-xs font-bold text-gray-800 hover:bg-amber-50 active:scale-[0.98] transition-all cursor-pointer"
        >
          Continue as guest
        </button>

        <p className="text-xs text-gray-500 font-medium pt-1">
          Need an account?{' '}
          <button onClick={() => setViewState('signup')} className="font-bold text-amber-500 hover:underline cursor-pointer">
            Sign up
          </button>
        </p>
      </div>
    );
  }

  // 3. GUEST MODE VIEW
  if (viewState === 'guest') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 md:text-3xl">Guest Mode</h1>
          <p className="text-xs text-gray-500 font-medium">You are currently browsing as a guest</p>
        </div>

        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-white font-bold">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Browsing as Guest</h2>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            Log in or create an account to save your delivery addresses, track orders, and unlock exclusive promos!
          </p>
          <button
            onClick={() => setViewState('login')}
            className="rounded-2xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-500 transition-all cursor-pointer"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  // 4. LOGGED-IN PROFILE VIEW
  return (
    <div className="space-y-6">
      <Toast message={toastMessage} isVisible={isToastVisible} title="Success!" variant="success" />

      <div>
        <h1 className="text-2xl font-black text-gray-800 md:text-3xl">My Profile</h1>
        <p className="text-xs text-gray-500 font-medium">Manage your personal information and preferences</p>
      </div>

      <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-black text-xl border border-amber-200 overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              currentUser?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">{currentUser?.name}</h2>
            <p className="text-xs text-gray-500">{currentUser?.phone}</p>
            <p className="text-xs text-gray-400 mt-0.5">{currentUser?.email}</p>
            {currentUser?.location && (
              <p className="text-[11px] text-amber-600 font-semibold mt-1">📍 {currentUser.location}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleOpenEditModal}
          className="rounded-full bg-gray-50 border border-gray-200 px-4 py-1.5 text-xs font-bold text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full rounded-2xl bg-red-50 border border-red-100 py-3 text-center text-xs font-bold text-red-500 hover:bg-red-100/70 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </button>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-800">Log out of SaWrap?</h3>
              <p className="text-xs text-gray-500">Sigurado ka bang gusto mong mag-logout ngayon?</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mx-auto h-20 w-20 mb-1">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 shadow-inner border border-gray-200 flex items-center justify-center">
                {editAvatar ? (
                  <img src={editAvatar} alt="Profile Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-amber-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amber-400 text-white shadow-md hover:bg-amber-500 transition-all">
                <Camera className="h-3 w-3" />
                <input type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Full Name</label>
              <div className={`mt-1 flex items-center rounded-2xl bg-gray-50 px-4 py-2.5 border transition-all ${editErrors.name ? 'border-red-400' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                />
              </div>
              {editErrors.name && <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{editErrors.name}</p>}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Email Address</label>
              <div className={`mt-1 flex items-center rounded-2xl bg-gray-50 px-4 py-2.5 border transition-all ${editErrors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                />
              </div>
              {editErrors.email && <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{editErrors.email}</p>}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Phone Number</label>
              <div className={`mt-1 flex items-center rounded-2xl bg-gray-50 px-4 py-2.5 border transition-all ${editErrors.phone ? 'border-red-400' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-600 mr-2 border-r border-gray-300 pr-2">+63</span>
                <input
                  type="text"
                  maxLength={10}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                />
              </div>
              {editErrors.phone && <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{editErrors.phone}</p>}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Location / Address</label>
              <div className={`mt-1 flex items-center rounded-2xl bg-gray-50 px-4 py-2.5 border transition-all ${editErrors.location ? 'border-red-400' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                />
              </div>
              {editErrors.location && <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{editErrors.location}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEditModal(false)} className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveEditClick} className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD CONFIRMATION MODAL (para sa Edit Profile save) */}
      {showEditPasswordConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-gray-800">Confirm Changes</h3>
              <p className="text-[11px] text-gray-500">Please enter your password to save these changes.</p>
            </div>

            <form onSubmit={handleConfirmEditSave} className="space-y-3">
              <div className={`flex items-center rounded-2xl bg-gray-50 px-4 py-3 border transition-all ${editPasswordError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type={showEditPasswordVisible ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoFocus
                  value={editPasswordInput}
                  onChange={(e) => { setEditPasswordInput(e.target.value); setEditPasswordError(''); }}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                />
                <button type="button" onClick={() => setShowEditPasswordVisible((s) => !s)} className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2">
                  {showEditPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {editPasswordError && (
                <p className="text-[11px] text-red-500 font-bold flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{editPasswordError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowEditPasswordConfirm(false); setShowEditModal(true); }}
                  className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  Back
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer">
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}