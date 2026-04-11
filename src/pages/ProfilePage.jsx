import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    fatherName: "",
    studentClass: "",
    schoolName: "",
    phone: "",
    parentsPhone: "",
    address: "",
    profileImage: "",
    goals: "",
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        dob: user.dob || "",
        fatherName: user.fatherName || "",
        studentClass: user.studentClass || "",
        schoolName: user.schoolName || "",
        phone: user.phone || "",
        parentsPhone: user.parentsPhone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
        goals: user.goals || "",
      });
    }
  }, [user]);

  const [fileError, setFileError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    setFileError("");
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setFileError("Please upload an image smaller than 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({ ...current, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        goals: formData.goals,
        dob: formData.dob,
        fatherName: formData.fatherName,
        studentClass: formData.studentClass,
        schoolName: formData.schoolName,
        parentsPhone: formData.parentsPhone,
        address: formData.address,
        profileImage: formData.profileImage,
      });
      setStatus("Profile updated successfully.");
      navigate(user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page section profile-page">
      <div className="dashboard-hero">
        <span className="pill">Profile</span>
        <h1>Edit your student profile</h1>
        <p>Update your student details here. Email cannot be changed once created.</p>
      </div>

      <form className="form-card profile-form" onSubmit={handleSubmit}>
        <div className="profile-image-row">
          <div>
            <label>
              Profile photo
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
            <p className="help-text">Upload an image file and save to your profile.</p>
            {fileError ? <p className="status-text error-text">{fileError}</p> : null}
          </div>
          {formData.profileImage ? (
            <div className="profile-image-preview">
              <img src={formData.profileImage} alt="Profile preview" />
            </div>
          ) : null}
        </div>

        <div className="profile-grid">
          <label>
            Name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            Email (cannot change)
            <input name="email" value={formData.email} disabled />
          </label>

          <label>
            Date of Birth
            <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
          </label>

          <label>
            Father&apos;s Name
            <input name="fatherName" value={formData.fatherName} onChange={handleChange} />
          </label>

          <label>
            Class
            <input name="studentClass" value={formData.studentClass} onChange={handleChange} />
          </label>

          <label>
            Name of school
            <input name="schoolName" value={formData.schoolName} onChange={handleChange} />
          </label>

          <label>
            Phone
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </label>

          <label>
            Guardian Phone
            <input name="parentsPhone" value={formData.parentsPhone} onChange={handleChange} />
          </label>

          <label>
            Address
            <textarea name="address" rows={3} value={formData.address} onChange={handleChange} />
          </label>

          <label>
            Goals / Target exam
            <input name="goals" value={formData.goals} onChange={handleChange} />
          </label>
        </div>

        <button className="solid-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
        {status ? <p className="status-text">{status}</p> : null}
      </form>
    </div>
  );
}
