import teamPhoto from "@/assets/team-photo.jpg";

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={teamPhoto}
              alt="Happy workforce management team"
              className="w-full h-auto rounded-2xl shadow-elegant"
            />
          </div>
          
          <div className="space-y-8">
            <div className="text-4xl text-accent">★★★★★</div>
            <blockquote className="text-2xl font-medium text-foreground leading-relaxed">
              "workforceOS transformed how we manage our 200+ employee schedules. We saved 12 hours per week and reduced scheduling conflicts by 95%."
            </blockquote>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-semibold text-foreground">Sarah Johnson</div>
                <div className="text-muted-foreground">Operations Director, RetailCorp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;