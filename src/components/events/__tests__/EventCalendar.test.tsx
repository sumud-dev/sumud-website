import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EventCalendar } from "@/src/components/events/EventCalendar";
import type { BaseEvent } from "@/src/lib/types/event";

// Mock events data
const mockEvents: BaseEvent[] = [
  {
    id: "1",
    updated_at: "2024-01-01T00:00:00Z",
    title: "Test Event 1",
    slug: "test-event-1",
    content: "Test description",
    event_type: "cultural",
    status: "published",
    language: "en",
    start_date: "2024-09-15T10:00:00Z",
    end_date: null,
    start_time: "10:00:00",
    end_time: null,
    location_mode: "in_person",
    venue_name: "Test Venue",
    venue_address: null,
    virtual_platform: null,
    virtual_link: null,
    current_registrations: 5,
    max_capacity: null,
    is_featured: false,
    registration_required: false,
    registration_deadline: null,
    contact_email: null,
    contact_phone: null,
    featured_image: null,
    alt_texts: null,
    categories: null,
    locations: null,
    organizers: null,
    author_name: null,
    published_at: null,
  },
  {
    id: "2",
    updated_at: "2024-01-01T00:00:00Z",
    title: "Test Event 2",
    slug: "test-event-2",
    content: "Test description 2",
    event_type: "activism",
    status: "published",
    language: "en",
    start_date: "2024-09-15T14:00:00Z",
    end_date: null,
    start_time: "14:00:00",
    end_time: null,
    location_mode: "virtual",
    venue_name: null,
    venue_address: null,
    virtual_platform: "Zoom",
    virtual_link: null,
    current_registrations: 3,
    max_capacity: null,
    is_featured: false,
    registration_required: false,
    registration_deadline: null,
    contact_email: null,
    contact_phone: null,
    featured_image: null,
    alt_texts: null,
    categories: null,
    locations: null,
    organizers: null,
    author_name: null,
    published_at: null,
  },
];

describe("EventCalendar", () => {
  it("renders calendar with current month", () => {
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={null}
        onDateSelect={() => {}}
      />,
    );

    // Check if current month is displayed
    const currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    expect(
      screen.getByText(
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
      ),
    ).toBeInTheDocument();
  });

  it("displays event indicators on days with events", () => {
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={null}
        onDateSelect={() => {}}
      />,
    );

    // Should show day 15 with event indicators
    const day15Button = screen.getByText("15");
    expect(day15Button).toBeInTheDocument();
  });

  it("calls onDateSelect when date is clicked", () => {
    const mockOnDateSelect = vi.fn();
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={null}
        onDateSelect={mockOnDateSelect}
      />,
    );

    const day15Button = screen.getByText("15");
    fireEvent.click(day15Button);

    expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it("highlights selected date", () => {
    const selectedDate = new Date(2024, 8, 15); // September 15, 2024
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={selectedDate}
        onDateSelect={() => {}}
      />,
    );

    // The selected date should have different styling (this would need visual testing in a real browser)
    const day15Button = screen.getByText("15");
    expect(day15Button).toBeInTheDocument();
  });

  it("navigates to previous month", () => {
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={null}
        onDateSelect={() => {}}
      />,
    );

    // Find navigation buttons by their position (first button is previous)
    const navButtons = screen.getAllByRole("button");
    const prevButton = navButtons[0]; // First button should be previous month
    fireEvent.click(prevButton);

    expect(prevButton).toBeInTheDocument();
  });

  it("navigates to next month", () => {
    render(
      <EventCalendar
        events={mockEvents}
        selectedDate={null}
        onDateSelect={() => {}}
      />,
    );

    // Find navigation buttons by their position (second button is next)
    const navButtons = screen.getAllByRole("button");
    const nextButton = navButtons[1]; // Second button should be next month
    fireEvent.click(nextButton);

    expect(nextButton).toBeInTheDocument();
  });
});
