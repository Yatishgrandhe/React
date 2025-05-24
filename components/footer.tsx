import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img
              src="/images/clt-volunteer-central-logo.png"
              alt="CLT Volunteer Central Logo"
              className="h-12 w-auto"
            />
            <div>
              <h3 className="font-bold text-lg">CLT Volunteer Central</h3>
              <p className="text-sm text-muted-foreground">Connecting volunteers with opportunities in Charlotte</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h4 className="font-medium mb-2">Quick Links</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href="/" className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/opportunities" className="hover:text-primary">
                    Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-primary">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-primary">
                    Log In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact</h4>
              <ul className="space-y-1 text-sm">
                <li>Charlotte, NC</li>
                <li>info@cltvolunteercentral.org</li>
                <li>(704) 555-1234</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CLT Volunteer Central. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
