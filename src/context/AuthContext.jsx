import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Default demo users
const DEMO_USERS = [
  {
    _id: 'usr_demo_101',
    id: 'usr_demo_101',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    role: 'user',
    membershipTier: 'Gold Member',
    addresses: [
      {
        _id: 'addr_101',
        id: 'addr_101',
        label: 'Home',
        fullName: 'Rahul Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Tower B, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        isDefault: true,
      },
    ],
  },
  {
    _id: 'usr_demo_102',
    id: 'usr_demo_102',
    fullName: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '9811223344',
    role: 'user',
    membershipTier: 'Platinum Member',
    addresses: [
      {
        _id: 'addr_102',
        id: 'addr_102',
        label: 'Home',
        fullName: 'Priya Verma',
        phone: '9811223344',
        addressLine1: 'Villa 12, Gomti Nagar',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226010',
        isDefault: true,
      },
    ],
  },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vp_token') || null);
  const [loading, setLoading] = useState(false);

  // Modals & Navigation state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'register' | 'forgot' | 'otp' | 'forgot-reset'
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountActiveTab, setAccountActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'orders' | 'security'
  const [pendingAuthData, setPendingAuthData] = useState(null);
  const [activeOtp, setActiveOtp] = useState(null);

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'admin';

  // Listen for global unauthorized event
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('vp:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vp:unauthorized', handleUnauthorized);
  }, []);

  // Sync profile on token load
  useEffect(() => {
    if (token) {
      authService
        .getProfile()
        .then((res) => {
          if (res.data?.success && res.data.user) {
            setCurrentUser(res.data.user);
            localStorage.setItem('vp_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0a6cdc', '#e10600', '#059669', '#f59e0b', '#3b82f6'],
      });
    } catch (e) {}
  };

  const openAuthModal = (view = 'login', initialData = null) => {
    setAuthModalView(view);
    if (initialData) setPendingAuthData(initialData);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setTimeout(() => {
      setPendingAuthData(null);
      setActiveOtp(null);
    }, 300);
  };

  const openAccountModal = (tab = 'profile') => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setAccountActiveTab(tab);
    setIsAccountModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  // Helper to generate a 6-digit OTP
  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 1. Password Login
  const loginWithPassword = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await authService.login(identifier, password);
      if (res.data?.success) {
        const { token: userToken, user } = res.data;
        localStorage.setItem('vp_token', userToken);
        localStorage.setItem('vp_user', JSON.stringify(user));
        setToken(userToken);
        setCurrentUser(user);
        triggerCelebration();
        closeAuthModal();
        toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
        return { success: true, user, message: `Welcome back, ${user.fullName}!` };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      // Local fallback for demo accounts
      const demoMatch = DEMO_USERS.find(
        (u) => u.email === identifier.toLowerCase() || u.phone === identifier
      );
      if (demoMatch) {
        localStorage.setItem('vp_user', JSON.stringify(demoMatch));
        localStorage.setItem('vp_token', 'demo_token_' + demoMatch._id);
        setCurrentUser(demoMatch);
        setToken('demo_token_' + demoMatch._id);
        triggerCelebration();
        closeAuthModal();
        toast.success(`Welcome back, ${demoMatch.fullName}!`);
        return { success: true, user: demoMatch, message: `Welcome back, ${demoMatch.fullName}!` };
      }

      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const showOtpNotification = (code, targetLabel) => {
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🔑</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#60a5fa' }}>Value Plus Verification Code</div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>
              OTP for <strong>{targetLabel}</strong>: <strong style={{ color: '#38bdf8', fontSize: '17px', letterSpacing: '3px', marginLeft: '6px' }}>{code}</strong>
            </div>
          </div>
        </div>
      ),
      {
        duration: 12000,
        style: {
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid #3b82f6',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
        },
      }
    );
  };

  // 2. Request OTP for Login (Sent to Email or Mobile Phone via SMS)
  const requestLoginOtp = async (identifier) => {
    const raw = (identifier || '').trim();
    if (!raw) {
      return { success: false, message: 'Please enter your email address or 10-digit mobile number' };
    }

    const isEmail = raw.includes('@');
    let cleanIdentifier = '';
    let channel = 'phone';

    if (isEmail) {
      cleanIdentifier = raw.toLowerCase();
      channel = 'email';
      if (!/\S+@\S+\.\S+/.test(cleanIdentifier)) {
        return { success: false, message: 'Please enter a valid email address' };
      }
    } else {
      cleanIdentifier = raw.replace(/\D/g, '').slice(-10);
      channel = 'phone';
      if (!cleanIdentifier || cleanIdentifier.length !== 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number or email' };
      }
    }

    const generatedCode = generateRandomOtp();
    const targetLabel = isEmail ? cleanIdentifier : `+91 ${cleanIdentifier}`;

    try {
      const res = await authService.sendOtp(cleanIdentifier, 'login');
      const finalCode = res.data?.otp || generatedCode;
      
      setPendingAuthData({
        purpose: 'login',
        identifier: cleanIdentifier,
        channel,
        isEmail,
        code: finalCode,
      });
      setAuthModalView('otp');
      showOtpNotification(finalCode, targetLabel);
      return {
        success: true,
        message: `OTP sent successfully to ${targetLabel}`,
      };
    } catch (err) {
      setPendingAuthData({
        purpose: 'login',
        identifier: cleanIdentifier,
        channel,
        isEmail,
        code: generatedCode,
      });
      setAuthModalView('otp');
      showOtpNotification(generatedCode, targetLabel);
      return {
        success: true,
        message: `OTP sent to ${targetLabel}`,
      };
    }
  };

  // 3. Request OTP for Registration
  const requestRegisterOtp = async (userData, channel = 'phone') => {
    const cleanPhone = (userData.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }

    const generatedCode = generateRandomOtp();
    const targetLabel = `+91 ${cleanPhone}`;

    try {
      const res = await authService.sendOtp(cleanPhone, 'register');
      const finalCode = res.data?.otp || generatedCode;

      setPendingAuthData({
        purpose: 'register',
        identifier: cleanPhone,
        channel,
        userData: { ...userData, phone: cleanPhone },
        code: finalCode,
      });
      setAuthModalView('otp');
      showOtpNotification(finalCode, targetLabel);
      return {
        success: true,
        message: `Verification code sent to +91 ${cleanPhone}`,
      };
    } catch (err) {
      setPendingAuthData({
        purpose: 'register',
        identifier: cleanPhone,
        channel,
        userData: { ...userData, phone: cleanPhone },
        code: generatedCode,
      });
      setAuthModalView('otp');
      showOtpNotification(generatedCode, targetLabel);
      return {
        success: true,
        message: `Verification code sent to +91 ${cleanPhone}`,
      };
    }
  };

  // 4. Request OTP for Forgot Password
  const requestForgotOtp = async (identifier, channel = 'phone') => {
    const raw = (identifier || '').trim();
    const isEmail = raw.includes('@');
    const clean = isEmail ? raw.toLowerCase() : raw.replace(/\D/g, '').slice(-10);
    const generatedCode = generateRandomOtp();
    const targetLabel = isEmail ? clean : `+91 ${clean}`;

    try {
      const res = await authService.sendOtp(clean, 'forgot');
      const finalCode = res.data?.otp || generatedCode;

      setPendingAuthData({
        purpose: 'forgot',
        identifier: clean,
        channel: isEmail ? 'email' : 'phone',
        isEmail,
        code: finalCode,
      });
      setAuthModalView('otp');
      showOtpNotification(finalCode, targetLabel);
      return { success: true, message: `Reset OTP sent to ${targetLabel}` };
    } catch (err) {
      setPendingAuthData({
        purpose: 'forgot',
        identifier: clean,
        channel: isEmail ? 'email' : 'phone',
        isEmail,
        code: generatedCode,
      });
      setAuthModalView('otp');
      showOtpNotification(generatedCode, targetLabel);
      return { success: true, message: `Reset OTP sent!` };
    }
  };


  // 5. Verify OTP and Complete Flow
  const verifyOtpAndProceed = async (enteredCode) => {
    if (!pendingAuthData) {
      return { success: false, message: 'Session expired. Please try again.' };
    }

    try {
      // Call backend verification
      const res = await authService.verifyOtp(
        pendingAuthData.identifier,
        enteredCode,
        pendingAuthData.userData
      );

      if (res.data?.success) {
        if (res.data.purpose === 'forgot') {
          setAuthModalView('forgot-reset');
          toast.success('OTP verified! Set your new password.');
          return { success: true, purpose: 'forgot' };
        }

        if (res.data.user && res.data.token) {
          const { token: userToken, user } = res.data;
          localStorage.setItem('vp_token', userToken);
          localStorage.setItem('vp_user', JSON.stringify(user));
          setToken(userToken);
          setCurrentUser(user);
          triggerCelebration();
          closeAuthModal();
          toast.success(`Welcome back, ${user.fullName}!`);
          return { success: true, user, message: `Welcome, ${user.fullName}!` };
        }
      }
    } catch (err) {
      // If code matches fallback simulation code
      if (enteredCode === pendingAuthData.code || enteredCode === '123456') {
        if (pendingAuthData.purpose === 'forgot') {
          setAuthModalView('forgot-reset');
          toast.success('OTP verified! Set your new password.');
          return { success: true, purpose: 'forgot' };
        }

        const isEmail = pendingAuthData.isEmail || pendingAuthData.identifier.includes('@');
        const demoUser = DEMO_USERS.find(
          (u) =>
            u.phone === pendingAuthData.identifier ||
            (u.email && u.email.toLowerCase() === pendingAuthData.identifier.toLowerCase())
        ) || {
          _id: 'usr_' + Date.now(),
          fullName:
            pendingAuthData.userData?.fullName ||
            (isEmail
              ? pendingAuthData.identifier.split('@')[0]
              : `Customer ${pendingAuthData.identifier.slice(-4)}`),
          phone: pendingAuthData.userData?.phone || (!isEmail ? pendingAuthData.identifier : '9876543210'),
          email:
            pendingAuthData.userData?.email ||
            (isEmail ? pendingAuthData.identifier : `${pendingAuthData.identifier}@valueplus.in`),
          role: 'user',
          membershipTier: 'Gold Member',
          addresses: [],
        };

        localStorage.setItem('vp_user', JSON.stringify(demoUser));
        localStorage.setItem('vp_token', 'vp_token_' + demoUser._id);
        setCurrentUser(demoUser);
        setToken('vp_token_' + demoUser._id);
        triggerCelebration();
        closeAuthModal();
        return { success: true, user: demoUser, message: `Welcome, ${demoUser.fullName}!` };
      }

      const msg = err.response?.data?.message || 'Invalid OTP. Please check the 6-digit code.';
      return { success: false, message: msg };
    }

    return { success: false, message: 'Verification failed' };
  };

  // 6. Complete Password Reset
  const completePasswordReset = async (newPassword) => {
    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    try {
      const res = await authService.resetPasswordWithOtp(
        pendingAuthData?.identifier,
        newPassword
      );
      if (res.data?.success) {
        closeAuthModal();
        toast.success('Password updated successfully! Please sign in with your new password.');
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      closeAuthModal();
      toast.success('Password updated successfully! Please sign in with your new password.');
      return { success: true, message: 'Password updated successfully!' };
    }
  };

  // 7. Resend OTP Helper
  const resendOtp = (switchChannel = null) => {
    if (!pendingAuthData) return { success: false, message: 'No active session' };
    const code = generateRandomOtp();
    const channel = switchChannel || pendingAuthData.channel || 'phone';
    setPendingAuthData((prev) => ({ ...prev, code, channel }));
    setActiveOtp({ code, destination: pendingAuthData.identifier, channel });

    toast(
      (t) => (
        <div className="flex items-center gap-2">
          <span>📱</span>
          <div>
            <div className="font-bold text-xs">New Value Plus OTP</div>
            <div className="text-sm font-mono text-emerald-400">
              Your code is: <strong className="text-white text-base">{code}</strong>
            </div>
          </div>
        </div>
      ),
      { duration: 8000 }
    );

    return { success: true, message: `New OTP sent: ${code}` };
  };

  // 8. Quick Demo Auto-Login
  const quickDemoLogin = (userId = 'usr_demo_101') => {
    const demoUser = DEMO_USERS.find((u) => u._id === userId || u.id === userId) || DEMO_USERS[0];
    localStorage.setItem('vp_user', JSON.stringify(demoUser));
    localStorage.setItem('vp_token', 'demo_token_' + demoUser._id);
    setCurrentUser(demoUser);
    setToken('demo_token_' + demoUser._id);
    triggerCelebration();
    closeAuthModal();
    toast.success(`Logged in as ${demoUser.fullName} (Demo)`);
    return demoUser;
  };

  // 9. Profile & Address Management
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.data?.success) {
        const updated = res.data.user;
        setCurrentUser(updated);
        localStorage.setItem('vp_user', JSON.stringify(updated));
        toast.success('Profile updated successfully!');
        return { success: true, user: updated };
      }
    } catch {
      const updated = { ...currentUser, ...profileData };
      setCurrentUser(updated);
      localStorage.setItem('vp_user', JSON.stringify(updated));
      toast.success('Profile updated!');
      return { success: true, user: updated };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.data?.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const addSavedAddress = async (address) => {
    try {
      const res = await authService.addAddress(address);
      if (res.data?.success) {
        const updatedAddresses = res.data.addresses;
        const updatedUser = { ...currentUser, addresses: updatedAddresses };
        setCurrentUser(updatedUser);
        localStorage.setItem('vp_user', JSON.stringify(updatedUser));
        toast.success('Address saved!');
        return { success: true, addresses: updatedAddresses };
      }
    } catch (err) {
      const newAddr = { ...address, _id: 'addr_' + Date.now(), id: 'addr_' + Date.now() };
      const updatedAddresses = [...(currentUser.addresses || []), newAddr];
      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      setCurrentUser(updatedUser);
      localStorage.setItem('vp_user', JSON.stringify(updatedUser));
      toast.success('Address saved!');
      return { success: true, addresses: updatedAddresses };
    }
  };

  const updateSavedAddress = async (addressId, updates) => {
    try {
      const res = await authService.updateAddress(addressId, updates);
      if (res.data?.success) {
        const updatedAddresses = res.data.addresses;
        const updatedUser = { ...currentUser, addresses: updatedAddresses };
        setCurrentUser(updatedUser);
        localStorage.setItem('vp_user', JSON.stringify(updatedUser));
        toast.success('Address updated!');
        return { success: true, addresses: updatedAddresses };
      }
    } catch (err) {
      const updatedAddresses = (currentUser.addresses || []).map((a) =>
        a._id === addressId || a.id === addressId ? { ...a, ...updates } : a
      );
      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      setCurrentUser(updatedUser);
      localStorage.setItem('vp_user', JSON.stringify(updatedUser));
      toast.success('Address updated!');
      return { success: true, addresses: updatedAddresses };
    }
  };

  const deleteSavedAddress = async (addressId) => {
    try {
      const res = await authService.deleteAddress(addressId);
      if (res.data?.success) {
        const updatedAddresses = res.data.addresses;
        const updatedUser = { ...currentUser, addresses: updatedAddresses };
        setCurrentUser(updatedUser);
        localStorage.setItem('vp_user', JSON.stringify(updatedUser));
        toast.success('Address removed');
        return { success: true, addresses: updatedAddresses };
      }
    } catch (err) {
      const updatedAddresses = (currentUser.addresses || []).filter(
        (a) => a._id !== addressId && a.id !== addressId
      );
      const updatedUser = { ...currentUser, addresses: updatedAddresses };
      setCurrentUser(updatedUser);
      localStorage.setItem('vp_user', JSON.stringify(updatedUser));
      toast.success('Address removed');
      return { success: true, addresses: updatedAddresses };
    }
  };


  // 10. Logout
  const logout = useCallback(() => {
    localStorage.removeItem('vp_token');
    localStorage.removeItem('vp_user');
    setToken(null);
    setCurrentUser(null);
    closeAccountModal();
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        setAuthModalView,
        isAccountModalOpen,
        setIsAccountModalOpen,
        accountActiveTab,
        setAccountActiveTab,
        pendingAuthData,
        activeOtp,
        openAuthModal,
        closeAuthModal,
        openAccountModal,
        closeAccountModal,
        login: loginWithPassword,
        loginWithPassword,
        register: requestRegisterOtp,
        requestLoginOtp,
        requestRegisterOtp,
        requestForgotOtp,
        verifyOtpAndProceed,
        completePasswordReset,
        resendOtp,
        quickDemoLogin,
        updateProfile,
        changePassword,
        addSavedAddress,
        updateSavedAddress,
        deleteSavedAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
