/**
 * Gallery Data
 * Add images to showcase your studio and work
 */

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: "gallery-1",
    src: "/images/gallery-1.jpg",
    alt: "Studio workspace with art supplies",
    title: "Creative Space",
  },
  {
    id: "gallery-2",
    src: "/images/gallery-2.jpg",
    alt: "Finished paintings on display",
    title: "Finished Works",
  },
  {
    id: "gallery-3",
    src: "/images/gallery-3.jpg",
    alt: "Brushes and painting supplies",
    title: "Our Tools",
  },
  {
    id: "gallery-4",
    src: "/images/gallery-4.jpg",
    alt: "People painting together",
    title: "Community Creating",
  },
  {
    id: "gallery-5",
    src: "/images/gallery-5.jpg",
    alt: "Detail of paint palette",
    title: "Color Palette",
  },
  {
    id: "gallery-6",
    src: "/images/gallery-6.jpg",
    alt: "Studio during event",
    title: "Live Event",
  },
];
