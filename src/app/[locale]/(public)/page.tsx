import Homepage from "@/src/components/Homepage";
import { getPublishedEvents } from "@/src/actions/events.actions";

export default async function Home() {
  const { data: events } = await getPublishedEvents();
  
  return <Homepage events={events || []} />;
}
