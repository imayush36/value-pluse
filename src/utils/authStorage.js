// Value Plus Authentication & Account Storage Utility

const USERS_KEY = 'valueplus_users_v1';
const CURRENT_USER_KEY = 'valueplus_current_user_v1';
const ACTIVE_OTP_KEY = 'valueplus_active_otp_v1';

// Initial Demo Seed Accounts
const INITIAL_DEMO_USERS = [
  {
    id: 'usr_demo_101',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    password: 'Demo@123', // In real prod, hashed
    gender: 'Male',
    dob: '1995-08-15',
    membershipTier: 'Gold Elite',
    memberSince: 'Jan 2024',
    walletPoints: 1250,
    avatarUrl: '',
    addresses: [
      {
        id: 'addr_101_home',
        type: 'Home',
        fullName: 'Rahul Sharma',
        phone: '9876543210',
        street: 'Flat 402, Tower B, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        isDefault: true,
      },
      {
        id: 'addr_101_work',
        type: 'Work',
        fullName: 'Rahul Sharma',
        phone: '9876543210',
        street: 'Logix Cyber Park, Tower C, 4th Floor',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        isDefault: false,
      },
    ],
  },
  {
    id: 'usr_demo_102',
    fullName: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '9812345678',
    password: 'Demo@123',
    gender: 'Female',
    dob: '1998-11-22',
    membershipTier: 'Platinum Club',
    memberSince: 'Mar 2024',
    walletPoints: 2400,
    avatarUrl: '',
    addresses: [
      {
        id: 'addr_102_home',
        type: 'Home',
        fullName: 'Priya Verma',
        phone: '9812345678',
        street: 'House 88, Near Metro Station, Sector 18',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        isDefault: true,
      },
    ],
  },
];

export const authStorage = {
  // --- USERS DATABASE ---
  getUsers: () => {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS));
        return INITIAL_DEMO_USERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load users from storage', e);
      return INITIAL_DEMO_USERS;
    }
  },

  saveUsers: (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  findUser: (identifier) => {
    const users = authStorage.getUsers();
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '').slice(-10);

    return users.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
      return uEmail === cleanId || (cleanDigits.length === 10 && uPhone === cleanDigits);
    });
  },

  createUser: (userData) => {
    const users = authStorage.getUsers();
    const cleanPhone = (userData.phone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Check existing
    const existing = users.find(
      (u) =>
        (cleanEmail && (u.email || '').toLowerCase() === cleanEmail) ||
        (cleanPhone && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone)
    );

    if (existing) {
      throw new Error('User with this email or mobile number already exists.');
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      fullName: userData.fullName || 'Valued Customer',
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password || 'Demo@123',
      gender: userData.gender || 'Not Specified',
      dob: userData.dob || '',
      membershipTier: 'Silver Club',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      walletPoints: 500, // Welcome bonus
      avatarUrl: userData.avatarUrl || '',
      addresses: userData.address
        ? [
            {
              id: 'addr_' + Date.now(),
              type: 'Home',
              fullName: userData.fullName || 'Valued Customer',
              phone: cleanPhone,
              street: userData.address,
              city: userData.city || 'Noida',
              state: userData.state || 'Uttar Pradesh',
              pincode: userData.pincode || '201301',
              isDefault: true,
            },
          ]
        : [],
    };

    users.push(newUser);
    authStorage.saveUsers(users);
    return newUser;
  },

  updateUser: (userId, updates) => {
    const users = authStorage.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    authStorage.saveUsers(users);

    // If updated user is current user, update session as well
    const currentUser = authStorage.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      authStorage.setCurrentUser(users[index]);
    }
    return users[index];
  },

  // --- SESSION MANAGEMENT ---
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get current user', e);
      return null;
    }
  },

  setCurrentUser: (user) => {
    try {
      if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
      } else {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  },

  clearCurrentUser: () => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to clear current user', e);
    }
  },

  // --- OTP GENERATION & VERIFICATION SYSTEM ---
  generateOtp: (identifier, channel = 'phone', purpose = 'login') => {
    // Generate high-entropy 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanId = String(identifier).trim();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    const otpData = {
      identifier: cleanId,
      code: otpCode,
      channel: channel, // 'phone' or 'email'
      purpose: purpose, // 'login', 'register', 'forgot'
      sentAt: now,
      expiresAt: expiresAt,
    };

    try {
      localStorage.setItem(ACTIVE_OTP_KEY, JSON.stringify(otpData));
    } catch (e) {
      console.error('Failed to save OTP', e);
    }

    return otpData;
  },

  getActiveOtp: () => {
    try {
      const data = localStorage.getItem(ACTIVE_OTP_KEY);
      if (!data) return null;
      const otp = JSON.parse(data);
      if (Date.now() > otp.expiresAt) {
        localStorage.removeItem(ACTIVE_OTP_KEY);
        return null;
      }
      return otp;
    } catch (e) {
      return null;
    }
  },

  verifyOtp: (identifier, enteredCode) => {
    const activeOtp = authStorage.getActiveOtp();
    if (!activeOtp) {
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    const cleanInputCode = String(enteredCode).trim();
    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const cleanTarget = String(activeOtp.identifier).trim().toLowerCase();

    // Check phone or email equivalence
    const isIdMatch =
      cleanIdentifier === cleanTarget ||
      cleanIdentifier.replace(/\D/g, '').slice(-10) === cleanTarget.replace(/\D/g, '').slice(-10);

    if (!isIdMatch) {
      return { success: false, message: 'OTP does not match the requested destination.' };
    }

    if (cleanInputCode !== activeOtp.code) {
      return { success: false, message: 'Incorrect OTP. Please enter the valid 6-digit code.' };
    }

    // OTP Verified! Clear active OTP
    localStorage.removeItem(ACTIVE_OTP_KEY);
    return { success: true, message: 'OTP verified successfully!' };
  },

  clearActiveOtp: () => {
    try {
      localStorage.removeItem(ACTIVE_OTP_KEY);
    } catch (e) {
      console.error(e);
    }
  },

  // --- ADDRESS MANAGEMENT HELPERS ---
  addAddress: (userId, addressData) => {
    const users = authStorage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const newAddr = {
      id: 'addr_' + Date.now(),
      type: addressData.type || 'Home',
      fullName: addressData.fullName || user.fullName,
      phone: addressData.phone || user.phone,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      isDefault: addressData.isDefault || user.addresses?.length === 0,
    };

    let updatedAddresses = user.addresses ? [...user.addresses] : [];
    if (newAddr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddr);

    const updatedUser = authStorage.updateUser(userId, { addresses: updatedAddresses });
    return updatedUser;
  },

  updateAddress: (userId, addressId, updates) => {
    const users = authStorage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || !user.addresses) return null;

    let updatedAddresses = user.addresses.map((a) => {
      if (a.id === addressId) {
        return { ...a, ...updates };
      }
      if (updates.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    return authStorage.updateUser(userId, { addresses: updatedAddresses });
  },

  deleteAddress: (userId, addressId) => {
    const users = authStorage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || !user.addresses) return null;

    const updatedAddresses = user.addresses.filter((a) => a.id !== addressId);
    // If deleted address was default and there are remaining addresses, make the first one default
    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    return authStorage.updateUser(userId, { addresses: updatedAddresses });
  },

  setDefaultAddress: (userId, addressId) => {
    const users = authStorage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || !user.addresses) return null;

    const updatedAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));

    return authStorage.updateUser(userId, { addresses: updatedAddresses });
  },
};
