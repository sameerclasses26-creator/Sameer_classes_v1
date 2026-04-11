import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { API_BASE } from "../api";
import SectionHeading from "../components/SectionHeading";
import CourseCard from "../components/CourseCard";
import shape1 from "../images/shape-1.png";
import shape2 from "../images/shape-2.png";
import shape3 from "../images/shape-3.png";
import shape4 from "../images/shape-4.png";
import bannerLine from "../images/banner-line.png";
import homePic from "../images/home-pic.jpg";
import categoryIcon1 from "../images/course-category-icon-1.png";
import categoryIcon2 from "../images/course-category-icon-2.png";
import categoryIcon3 from "../images/course-category-icon-3.png";
import categoryIcon4 from "../images/course-category-icon-4.png";
import categoryIcon5 from "../images/course-category-icon-5.png";
import categoryIcon6 from "../images/course-category-icon-6.png";
import aboutImg from "../images/about-img.png";
import { useAuth } from "../context/AuthContext";

const categories = [
  { icon: categoryIcon1, title: "Pre-Foundation", subtitle: "Class 6th to 10th" },
  { icon: categoryIcon2, title: "Foundation", subtitle: "Class 11th & 12th" },
  { icon: categoryIcon3, title: "IIT-JEE", subtitle: "Engineering entrance" },
  { icon: categoryIcon4, title: "KVPY", subtitle: "Scholarship exams" },
  { icon: categoryIcon5, title: "NTSE", subtitle: "National Talent Search" },
  { icon: categoryIcon6, title: "Olympiad", subtitle: "Competitive exam prep" },
];

const features = [
  {
    title: "Live classroom training",
    description: "Interactive coaching with structured lessons and daily practice.",
  },
  {
    title: "Result-focused curriculum",
    description: "Designed to help students score higher in board and entrance exams.",
  },
  {
    title: "Mentor support",
    description: "Dedicated faculty guidance for doubt solving and exam planning.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      const response = await fetch(`${API_BASE}/content/courses`);
      if (response.ok) {
        setCourses(await response.json());
      }
    };

    loadCourses().catch(() => {
      setCourses([]);
    });
  }, []);

  return (
    <div className="page">
      <section className="home">
        <div className="hero-shapes">
          <img className="shape shape-1" src={shape1} alt="shape" />
          <img className="shape shape-2" src={shape2} alt="shape" />
          <img className="shape shape-3" src={shape3} alt="shape" />
          <img className="shape shape-4" src={shape4} alt="shape" />
        </div>

        <div className="home-left">
          <p className="section-subtitle">Welcome To Sameer Classes</p>
          <h1 className="main-heading">
            Get Classes From Top
            <span className="underline-img">
              Instructor <img src={bannerLine} alt="line" />
            </span>
          </h1>
          <p className="section-text">
            Sameer Classes is one of the premier coaching institutes of Motihari, providing classroom coaching for JEE (Main), JEE (Advanced), foundation courses, NTSE, and Olympiads. We are dedicated to helping students build confidence, master concepts, and achieve high scores.
          </p>
          <div className="home-btn-group">
            <Link className="solid-button" to="/courses">
              Explore Courses
            </Link>
            {user ? (
              <Link className="ghost-button" to={user.role === "admin" ? "/admin" : "/dashboard"}>
                Go to Dashboard
              </Link>
            ) : (
              <Link className="ghost-button" to="/login">
                Login / Signup
              </Link>
            )}
          </div>
        </div>

        <div className="home-right">
          <div className="img-box">
            <img className="banner-img" src={homePic} alt="banner image" />
          </div>
        </div>
      </section>

      <section className="category">
        <p className="section-subtitle">Course Category</p>
        <h2 className="section-title">Some Courses</h2>
        <div className="course-category-list">
          {categories.map((item) => (
            <div key={item.title} className="course-category-item">
              <img src={item.icon} alt={item.title} className="category-icon-img" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about">
        <div className="about-grid">
          <div>
            <p className="section-subtitle">About Us</p>
            <h2 className="section-title">We Have Best Classroom Education</h2>
            <p className="section-text">
              Sameer Classes started its journey in 2019 with a single goal: help students succeed in competitive exams. We offer result-driven lessons, guided practice, and personalized mentorship for every learner.
            </p>
          </div>
          <div className="about-img-box">
            <img src={aboutImg} alt="about image" />
          </div>
        </div>
      </section>

      <section className="features">
        <p className="section-subtitle">Why Sameer Classes</p>
        <h2 className="section-title">See What We Provide to Students</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Featured Programs"
          title="Popular coaching programs for every student"
          description="Browse the top courses that students are choosing to prepare for exams, boards, and career success."
        />
        <div className="card-grid">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      <section className="contact-cta">
        <div>
          <p className="section-subtitle">Get In Touch</p>
          <h2 className="section-title">Ready to join Sameer Classes?</h2>
          <p className="section-text">
            Contact us for admissions, course details, or to schedule a free counseling session. We are here to help you choose the right path.
          </p>
        </div>
        <Link className="solid-button" to="/contact">
          Contact Us
        </Link>
      </section>
    </div>
  );
}
