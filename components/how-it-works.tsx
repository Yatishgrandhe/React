import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarCheck, ClipboardList, Search, UserCheck } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Find Opportunities",
      description: "Browse through our curated list of volunteer opportunities in your area.",
    },
    {
      icon: <UserCheck className="h-10 w-10 text-primary" />,
      title: "Sign Up",
      description: "Create an account and register for the opportunities that interest you.",
    },
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      title: "Volunteer",
      description: "Show up and make a difference in your community.",
    },
    {
      icon: <ClipboardList className="h-10 w-10 text-primary" />,
      title: "Log Hours",
      description: "Track your volunteer hours and see your impact grow over time.",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to find, sign up for, and track volunteer opportunities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/opportunities">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
