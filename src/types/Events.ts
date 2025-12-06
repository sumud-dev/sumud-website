export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string | null;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  capacity: number | null;
  attendees: number;
  status: "draft" | "upcoming" | "ongoing" | "completed" | "cancelled";
  imageUrl: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventFormData = {
  title: string;
  description: string;
  location: string;
  address?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  capacity?: number;
  status: "draft" | "upcoming" | "ongoing" | "completed" | "cancelled";
  imageUrl?: string;
  isOnline: boolean;
  onlineUrl?: string;
};
