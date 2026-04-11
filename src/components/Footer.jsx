import React from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-section">
          <h2 className="logo">Sameer Classes</h2>

          <p>
            Kaushlya Kunj, Chandmari (EKAUNA), Ward No-27, Motihari,
            East Champaran, India
          </p>

          <p>📧 sameerclasses@gmail.com</p>
          <p>📞 +91 7261083492</p>

          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-section">
          <h3>Our Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Courses</a></li>
            <li><a href="#">Faculty</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Information */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li><a href="#">Coaching</a></li>
            <li><a href="#">Student Life</a></li>
            <li><a href="#">Hostel</a></li>
            <li><a href="#">Admission</a></li>
            <li><a href="#">Scholarship</a></li>
          </ul>
        </div>

        {/* Map */}
        <div className="footer-section">
          <h3>Location</h3>
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Motihari%20Bihar&output=embed"
            className="map"
          ></iframe>
        </div>

      </div>

      
    </footer>
  );
};

export default Footer;