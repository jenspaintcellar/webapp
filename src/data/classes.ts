/**
 * Classes and Experiences
 * Edit these to reflect actual offerings
 */

export interface ClassExperience {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  learnMoreUrl: string;
}

export const classExperiences: ClassExperience[] = [
  {
    id: "painting-classes",
    title: "Painting Classes",
    description: "Explore painting techniques in a relaxed creative environment. Perfect for beginners and experienced artists alike.",
    image: "/images/class-1.jpg",
    imageAlt: "Painting class in session",
    learnMoreUrl: "#classes",
  },
  {
    id: "paint-create",
    title: "Paint & Create",
    description: "A casual creative experience designed for groups and individuals. Bring your friends and make something together.",
    image: "/images/class-2.jpg",
    imageAlt: "Group painting session",
    learnMoreUrl: "#classes",
  },
  {
    id: "private-sessions",
    title: "Private Sessions",
    description: "One-on-one personalized painting instruction tailored to your skill level and creative goals.",
    image: "/images/class-3.jpg",
    imageAlt: "Private painting lesson",
    learnMoreUrl: "/contact",
  },
  {
    id: "open-studio",
    title: "Open Studio",
    description: "A flexible space for people who want time to create. Drop in and paint at your own pace.",
    image: "/images/class-4.jpg",
    imageAlt: "Open studio space",
    learnMoreUrl: "#classes",
  },
];
