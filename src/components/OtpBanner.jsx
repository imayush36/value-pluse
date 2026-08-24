import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { smsService } from '../utils/smsService';
import { Smartphone, Mail, Copy, Check, Sparkles, X, MessageSquare } from 'lucide-react';

export default function OtpBanner() {
  const { activeOtp, setActiveOtp } = useAuth();
  const { showToast } = useShop();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!activeOtp) return;

    const calculateRemaining = () => {
      const remaining = Math.max(0, Math.floor((activeOtp.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setActiveOtp(null);
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [activeOtp, setActiveOtp]);

  if (!activeOtp) return null;

  const isPhone = activeOtp.channel === 'phone';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeOtp.code);
    setCopied(true);
    showToast(`📋 OTP "${activeOtp.code}" copied to clipboard!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFill = () => {
    window.dispatchEvent(
      new CustomEvent('valueplus_autofill_otp', {
        detail: { code: activeOtp.code },
      })
    );
    showToast(`⚡ Auto-filled OTP: ${activeOtp.code}`);
  };

  const handleSendToPhoneWhatsApp = () => {
    smsService.sendWhatsAppOtp(activeOtp.identifier, activeOtp.code);
    showToast(`📲 Opening WhatsApp on phone with code ${activeOtp.code}...`);
  };

  return (
    <aside className="otp-simulator-banner" aria-label="Simulated OTP Alert" role="alert">
      <div className="otp-sim-header">
        <div className="otp-sim-badge">
          {isPhone ? <Smartphone size={14} /> : <Mail size={14} />}
          <span>{isPhone ? 'Real / Simulated SMS' : 'Real / Simulated Email'}</span>
        </div>
        <span className="otp-sim-timer">Expires in {timeFormatted}</span>
        <button
          className="otp-sim-close"
          onClick={() => setActiveOtp(null)}
          aria-label="Dismiss OTP banner"
        >
          <X size={14} />
        </button>
      </div>

      <div className="otp-sim-body">
        <div className="otp-sim-dest">
          <strong>To: </strong>
          <span>{activeOtp.identifier}</span>
        </div>
        <div className="otp-sim-msg">
          Value Plus verification code:{' '}
          <span className="otp-sim-code">{activeOtp.code}</span>. Do not share this with anyone.
        </div>
      </div>

      <div className="otp-sim-actions">
        <button type="button" className="otp-sim-btn otp-sim-btn-autofill" onClick={handleAutoFill}>
          <Sparkles size={13} />
          <span>Auto-Fill</span>
        </button>
        {isPhone && (
          <button type="button" className="otp-sim-btn otp-sim-btn-whatsapp" onClick={handleSendToPhoneWhatsApp}>
            <MessageSquare size={13} />
            <span>WhatsApp</span>
          </button>
        )}
        <button type="button" className="otp-sim-btn otp-sim-btn-copy" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </aside>
  );
}

