import React, { useEffect, useState } from 'react';
import './Preferences.css';
import { toast } from 'react-toastify';

const Preferences = () => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: false,
    reviewReminders: true,
    emailSummary: true,
    smsAlerts: false,
    marketingEmails: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse preferences:', error);
      }
    }
  }, []);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(settings));
    toast.success('Preferences saved');
  };

  return (
    <div className="preferences-page">
      <div className="preferences-hero">
        <h1>Preferences</h1>
        <p>Control how you hear from us and what you get notified about.</p>
        <button className="btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="preferences-grid">
        <section className="preferences-card">
          <h2>Notifications</h2>
          <p>Choose which in-app alerts you receive.</p>

          <div className="setting-row">
            <div>
              <h4>Order Updates</h4>
              <span>Status changes, confirmations, and refunds.</span>
            </div>
            <button
              className={`toggle ${settings.orderUpdates ? 'on' : ''}`}
              onClick={() => toggleSetting('orderUpdates')}
            >
              <span></span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <h4>Delivery Alerts</h4>
              <span>Live tracking and arrival reminders.</span>
            </div>
            <button
              className={`toggle ${settings.deliveryAlerts ? 'on' : ''}`}
              onClick={() => toggleSetting('deliveryAlerts')}
            >
              <span></span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <h4>Promotions</h4>
              <span>Deals, coupons, and seasonal offers.</span>
            </div>
            <button
              className={`toggle ${settings.promotions ? 'on' : ''}`}
              onClick={() => toggleSetting('promotions')}
            >
              <span></span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <h4>Review Reminders</h4>
              <span>Request a review after delivery.</span>
            </div>
            <button
              className={`toggle ${settings.reviewReminders ? 'on' : ''}`}
              onClick={() => toggleSetting('reviewReminders')}
            >
              <span></span>
            </button>
          </div>
        </section>

        <section className="preferences-card">
          <h2>Messages</h2>
          <p>Pick your preferred channels for updates.</p>

          <div className="setting-row">
            <div>
              <h4>Email Summary</h4>
              <span>Weekly highlights of your orders.</span>
            </div>
            <button
              className={`toggle ${settings.emailSummary ? 'on' : ''}`}
              onClick={() => toggleSetting('emailSummary')}
            >
              <span></span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <h4>SMS Alerts</h4>
              <span>Delivery ETA and urgent changes.</span>
            </div>
            <button
              className={`toggle ${settings.smsAlerts ? 'on' : ''}`}
              onClick={() => toggleSetting('smsAlerts')}
            >
              <span></span>
            </button>
          </div>

          <div className="setting-row">
            <div>
              <h4>Marketing Emails</h4>
              <span>New restaurants and featured menus.</span>
            </div>
            <button
              className={`toggle ${settings.marketingEmails ? 'on' : ''}`}
              onClick={() => toggleSetting('marketingEmails')}
            >
              <span></span>
            </button>
          </div>
        </section>

        <section className="preferences-card highlight">
          <h2>Privacy Controls</h2>
          <p>We only use your data to personalize your experience.</p>

          <div className="privacy-list">
            <div>
              <h4>Order Insights</h4>
              <span>Help us recommend better dishes based on past orders.</span>
            </div>
            <div>
              <h4>Location Usage</h4>
              <span>Used only for delivery estimates and nearby picks.</span>
            </div>
            <div>
              <h4>Personalized Deals</h4>
              <span>Receive offers tailored to your preferences.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Preferences;
