export interface ServiceCard {
  id: string;
  num: string;
  title: string;
  description: string;
  iconName: string;
  buttonText: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type TabState = "home" | "services" | "pricing" | "how-it-works" | "onboarding" | "client-dashboard" | "lawyer-dashboard" | "estate-login" | "overall-admin";
