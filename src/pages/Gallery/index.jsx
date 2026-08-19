import "./Gallery.css";

function Gallery() {
  const galleryImages = [
    {
      src: "/gallery/wedding1.jpg",
      title: "Wedding Moments",
    },
    {
      src: "/gallery/wedding2.jpg",
      title: "Beautiful Memories",
    },
    {
      src: "/gallery/wedding3.jpg",
      title: "Wedding Celebration",
    },
    {
      src: "/gallery/wedding4.jpg",
      title: "Together Forever",
    },
    {
      src: "/gallery/wedding5.jpg",
      title: "Special Moments",
    },
    {
      src: "/gallery/wedding6.jpg",
      title: "A New Beginning",
    },
  ];

  return (
    <div className="gallery-page">

      {/* Header */}
      <div className="gallery-header">
        <h1>Jaiswal Vaivaahiki Gallery</h1>

        <p>
          Celebrating beautiful moments of love,
          family and togetherness.
        </p>
      </div>

      {/* Gallery */}
      <div className="gallery-container">

        <div className="gallery-grid">

          {galleryImages.map((image, index) => (
            <div
              className="gallery-card"
              key={index}
            >
              <img
                src={image.src}
                alt={image.title}
                className="gallery-image"
              />

              <div className="gallery-overlay">
                <h3>{image.title}</h3>
              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Gallery;