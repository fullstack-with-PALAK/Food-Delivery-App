import React, { useContext, useState } from "react";
import "./UserProfile.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { url, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [editMode, setEditMode] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${url}/api/user/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="user-profile">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>👤</span>
            </div>
            <h2>{profileData.name || "User"}</h2>
            <p>{profileData.email}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              📋 Profile
            </button>
            <button
              className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              🔐 Change Password
            </button>
            <button
              className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => setActiveTab("preferences")}
            >
              ⚙️ Preferences
            </button>
            <button className="tab-btn logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!editMode && (
                  <button
                    className="edit-btn"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              <form onSubmit={updateProfile} className="profile-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                    disabled={!editMode}
                  />
                </div>

                <div className="form-divider"></div>

                <h4>Delivery Address</h4>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    placeholder="Enter street address"
                    disabled={!editMode}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      placeholder="City"
                      disabled={!editMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleProfileChange}
                      placeholder="State"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={profileData.zipcode}
                    onChange={handleProfileChange}
                    placeholder="Zip code"
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="profile-section">
              <h3>Change Password</h3>
              <form onSubmit={changePassword} className="profile-form">
                <div className="form-group password-input">
                  <label>Current Password *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-pwd"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPasswords.current ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group password-input">
                  <label>New Password *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min 8 characters)"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-pwd"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                    >
                      {showPasswords.new ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-group password-input">
                  <label>Confirm Password *</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-pwd"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    >
                      {showPasswords.confirm ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="profile-section">
              <h3>Notification Preferences</h3>
              <div className="preferences-list">
                <div className="preference-item">
                  <div>
                    <p className="pref-title">Order Updates</p>
                    <p className="pref-desc">
                      Get notified about your order status
                    </p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked disabled />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div>
                    <p className="pref-title">Promotional Offers</p>
                    <p className="pref-desc">
                      Receive exclusive deals and offers
                    </p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked disabled />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div>
                    <p className="pref-title">Delivery Reminders</p>
                    <p className="pref-desc">Get reminders on delivery day</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked disabled />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div>
                    <p className="pref-title">Email Notifications</p>
                    <p className="pref-desc">
                      Receive email updates for all activities
                    </p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked disabled />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button className="delete-account-btn" disabled>
                  🗑️ Delete Account (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
