function HeroPage() {
  return (
      <div className="min-h-screen bg-white">
          {/* Hero Section - Split Layout */}
          <section className="flex flex-col lg:flex-row">
              {/* Left side - White background with content */}
              <div className="flex-1 bg-white px-8 lg:px-16 py-16 lg:py-24">
                  <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
                      Welcome to iBank
                  </h1>
                  <p className="text-gray-600 text-lg mb-8">
                      Your internal knowledge management portal
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    ACTION BUTTONS GO HERE
                  </div>
              </div>

              {/* Right side - Navy background with branding */}
              <div className="lg:w-[400px] bg-hanover-deepblue flex items-center justify-center py-16 lg:py-24 px-8">
                  <div className="text-center">
                      <p className="text-gray-400 text-2xl font-light">The Hanover</p>
                      <p className="text-gray-400 text-2xl font-light">Insurance Group</p>
                  </div>
              </div>
          </section>

          {/* Quick Links Section */}
          <section className="py-12 bg-[#F5F5F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-2 gap-6">
                      {/* My Frequently Used Links */}
                      <div className="bg-white border-l-4 border-l-hanover-green p-6">
                          <h3 className="text-lg font-bold text-navy mb-4">
                              My Frequently Used Links
                          </h3>
                          QUICK LINKS GO HERE
                      </div>

                      {/* Role's Frequently Used Links */}
                      <div className="bg-white border-l-4 border-l-hanover-green p-6">
                          <h3 className="text-lg font-bold text-navy mb-4">
                              {"My Role's Frequently Used Links"}
                          </h3>
                          <ul className="space-y-3">
                              ROLE LINKS GO HERE
                          </ul>
                      </div>
                  </div>
              </div>
          </section>

          {/* Footer */}
          <footer className="bg-navy py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
          </footer>
      </div>
  );
}

export default HeroPage;
