export default function StatsSection() {
  return (
    <section className="py-16 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Our Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Together, our volunteers are making a real difference in communities around the world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-background rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div className="text-sm text-muted-foreground">Registered Volunteers</div>
          </div>
          <div className="bg-background rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-sm text-muted-foreground">Hours Contributed</div>
          </div>
          <div className="bg-background rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Organizations Served</div>
          </div>
          <div className="bg-background rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-primary mb-2">250+</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </div>
        </div>
      </div>
    </section>
  )
}
