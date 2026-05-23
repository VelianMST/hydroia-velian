import Hero from "@/components/Hero";
import InstallPrompt from "@/components/InstallPrompt";
import QuickActions from "@/components/QuickActions";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <>
      <Hero />
      <InstallPrompt />
      <QuickActions />
      <Dashboard />
    </>
  );
}
