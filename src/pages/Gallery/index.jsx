import "./Gallery.css";

function Gallery() {

  const galleryImages = [
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068766/wedding1.png",
      title: "Wedding Moments",
    },
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068766/wedding2.png",
      title: "Beautiful Memories",
    },
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068766/wedding3.png",
      title: "Wedding Celebration",
    },
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068767/wedding4.png",
      title: "Together Forever",
    },
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068767/wedding5.png",
      title: "Special Moments",
    },
    {
      src: "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1000/v1788068768/wedding6.png",
      title: "A New Beginning",
    },
  ];

  return (
    <div className="gallery-page">

      {/* Header */}
      <div className="gallery-header">

        <h1>
          Jaiswal Vaivaahiki Gallery
        </h1>

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
                loading="lazy"
              />

              <div className="gallery-overlay">

                <h3>
                  {image.title}
                </h3>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Gallery;
