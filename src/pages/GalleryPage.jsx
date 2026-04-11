import { useMemo, useState } from "react";

const gallerySections = [
  {
    id: "holi-2022",
    label: "Holi 2022",
    images: [
      { src: new URL("../images/holi 2022/1.jpeg", import.meta.url).href, file: "1.jpeg" },
      { src: new URL("../images/holi 2022/2.jpeg", import.meta.url).href, file: "2.jpeg" },
      { src: new URL("../images/holi 2022/3.jpeg", import.meta.url).href, file: "3.jpeg" },
      { src: new URL("../images/holi 2022/4.jpeg", import.meta.url).href, file: "4.jpeg" },
      { src: new URL("../images/holi 2022/5.jpeg", import.meta.url).href, file: "5.jpeg" },
      { src: new URL("../images/holi 2022/6.jpeg", import.meta.url).href, file: "6.jpeg" },
      { src: new URL("../images/holi 2022/7.jpeg", import.meta.url).href, file: "7.jpeg" },
      { src: new URL("../images/holi 2022/8.jpeg", import.meta.url).href, file: "8.jpeg" },
      { src: new URL("../images/holi 2022/9.jpeg", import.meta.url).href, file: "9.jpeg" },
    ],
  },
  {
    id: "saraswati-2022",
    label: "Saraswati Puja 2022",
    images: [
      { src: new URL("../images/saraswatipuja/1.jpeg", import.meta.url).href, file: "1.jpeg" },
      { src: new URL("../images/saraswatipuja/2.jpeg", import.meta.url).href, file: "2.jpeg" },
      { src: new URL("../images/saraswatipuja/3.jpeg", import.meta.url).href, file: "3.jpeg" },
      { src: new URL("../images/saraswatipuja/4.jpeg", import.meta.url).href, file: "4.jpeg" },
      { src: new URL("../images/saraswatipuja/5.jpeg", import.meta.url).href, file: "5.jpeg" },
      { src: new URL("../images/saraswatipuja/6.jpeg", import.meta.url).href, file: "6.jpeg" },
      { src: new URL("../images/saraswatipuja/7.jpeg", import.meta.url).href, file: "7.jpeg" },
    ],
  },
  {
    id: "teachers-2022",
    label: "Teacher's Day 2022",
    images: [
      { src: new URL("../images/Teachersday/1.jpg", import.meta.url).href, file: "1.jpg" },
      { src: new URL("../images/Teachersday/3.jpg", import.meta.url).href, file: "3.jpg" },
    ],
  },
  {
    id: "saraswati-2023",
    label: "Saraswati Puja 2023",
    images: [
      { src: new URL("../images/saraswatipuja2023/1.jpeg", import.meta.url).href, file: "1.jpeg" },
      { src: new URL("../images/saraswatipuja2023/2.jpeg", import.meta.url).href, file: "2.jpeg" },
      { src: new URL("../images/saraswatipuja2023/3.jpeg", import.meta.url).href, file: "3.jpeg" },
      { src: new URL("../images/saraswatipuja2023/4.jpeg", import.meta.url).href, file: "4.jpeg" },
      { src: new URL("../images/saraswatipuja2023/5.jpeg", import.meta.url).href, file: "5.jpeg" },
    ],
  },
  {
    id: "campus-photos",
    label: "Campus Photos",
    images: [
      { src: new URL("../images/campus_pic/1.jpeg", import.meta.url).href, file: "1.jpeg" },
      { src: new URL("../images/campus_pic/2.jpeg", import.meta.url).href, file: "2.jpeg" },
      { src: new URL("../images/campus_pic/3.jpeg", import.meta.url).href, file: "3.jpeg" },
      { src: new URL("../images/campus_pic/4.jpeg", import.meta.url).href, file: "4.jpeg" },
      { src: new URL("../images/campus_pic/5.png", import.meta.url).href, file: "5.png" },
      { src: new URL("../images/campus_pic/sammer.jpeg", import.meta.url).href, file: "sammer.jpeg" },
      { src: new URL("../images/campus_pic/smart-board1.jpg", import.meta.url).href, file: "smart-board1.jpg" },
    ],
  },
];

export default function GalleryPage() {
  const [activeSection, setActiveSection] = useState(gallerySections[0].id);
  const [preview, setPreview] = useState(null);

  const selectedSection = useMemo(
    () => gallerySections.find((section) => section.id === activeSection),
    [activeSection]
  );

  return (
    <div className="page gallery-page">
      <section className="gallery-head">
        <div className="gallery-title">
          <h1>Gallery</h1>
          <p>All the major events, campus moments, and celebration photos from Sameer Classes.</p>
        </div>

        <div className="gallery-filter">
          {gallerySections.map((section) => (
            <button
              key={section.id}
              className={section.id === activeSection ? "gf-btn gf-btn-active" : "gf-btn"}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>
      </section>

      <section className="gallery-grid">
        {selectedSection.images.map((image) => (
          <div key={image.file} className="gallery-item">
            <img
              src={image.src}
              alt={`${selectedSection.label} ${image.file}`}
              onClick={() => setPreview(image.src)}
            />
            <div className="gallery-file-name">{image.file}</div>
          </div>
        ))}
      </section>

      {preview && (
        <div className="preview-overlay" role="dialog" aria-modal="true">
          <button className="preview-close" type="button" onClick={() => setPreview(null)}>
            Close
          </button>
          <img className="preview-image" src={preview} alt="Preview" />
        </div>
      )}
    </div>
  );
}
