import { Button } from "@/components/ui/button"
import Link from "next/link"
import HeroSection from "@/components/hero-section"
import FeaturedOpportunities from "@/components/featured-opportunities"
import StatsSection from "@/components/stats-section"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturedOpportunities />
      <StatsSection />
      <HowItWorks />
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our community of volunteers and start making an impact today.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/opportunities">Find Opportunities</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
