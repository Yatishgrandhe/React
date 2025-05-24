import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Make a <span className="text-primary">Difference</span> in Charlotte
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-lg">
              Connect with meaningful volunteer opportunities and track your impact with our easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/opportunities">Find Opportunities</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signup">Join Our Community</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="aspect-video rounded-lg bg-gradient-to-r from-primary/20 to-primary/40 shadow-xl">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Volunteers working together"
                  className="rounded-lg object-cover w-full h-full mix-blend-overlay"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
