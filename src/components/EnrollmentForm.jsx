import { useState } from "react";
import "./EnrollmentForm.css";

const EnrollmentForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    studentClass: "",
    schoolName: "",
    parentsName: "",
    parentsPhone: "",
    address: "",
    interestedCourses: [],
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoursesChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      interestedCourses: checked
        ? [...prev.interestedCourses, value]
        : prev.interestedCourses.filter((course) => course !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit enrollment request");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setFormData({
        studentName: "",
        email: "",
        phone: "",
        studentClass: "",
        schoolName: "",
        parentsName: "",
        parentsPhone: "",
        address: "",
        interestedCourses: [],
        message: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="enrollment-container">
        <div className="enrollment-success">
          <div className="success-icon">✓</div>
          <h3>Enrollment Request Submitted!</h3>
          <p>
            Thank you for your interest. Our team will review your request and
            contact you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-container">
      <div className="enrollment-form-wrapper">
        <div className="form-header">
          <h2>Join Our Coaching Classes</h2>
          <p>Fill out the form below to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="enrollment-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentName">Student Name *</label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Your phone number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="studentClass">Class *</label>
              <select
                id="studentClass"
                name="studentClass"
                value={formData.studentClass}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your class</option>
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
                <option value="9th">9th</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>
            </div>
          </div>

         

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parentsName">Parent/Guardian Name *</label>
              <input
                type="text"
                id="parentsName"
                name="parentsName"
                value={formData.parentsName}
                onChange={handleInputChange}
                placeholder="Parent's full name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="parentsPhone">Parent's Phone *</label>
              <input
                type="tel"
                id="parentsPhone"
                name="parentsPhone"
                value={formData.parentsPhone}
                onChange={handleInputChange}
                placeholder="Parent's phone number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="City, State"
                rows="2"
                required
              />
            </div>
          </div>

         


          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Enrollment Request"}
          </button>

          <p className="form-note">* Required fields</p>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentForm;
