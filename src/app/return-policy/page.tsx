export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/10 dark:to-green-950/10 py-12">
      <div className="container max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Return Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our commitment to quality and customer satisfaction
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12">
            <div className="space-y-8">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Policy Overview
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    At Tayaima Store, we take pride in delivering fresh, high-quality products to your doorstep. 
                    <strong className="text-green-600 dark:text-green-400"> We generally do not accept returns</strong> as we deal with perishable goods 
                    and fresh produce that require immediate consumption. However, we understand that exceptional circumstances may arise.
                  </p>
                </div>
              </section>

              {/* When Returns Are Accepted */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  When Returns Are Accepted
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Damaged Products During Delivery</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      If products arrive damaged, spoiled, or in poor condition due to delivery issues, we will accept returns and provide a full refund or replacement. 
                      This must be reported immediately upon delivery.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Wrong Items Delivered</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      If you receive items different from what you ordered, we will arrange for exchange or refund. 
                      Please contact us immediately within 2 hours of delivery.
                    </p>
                  </div>
                </div>
              </section>

              {/* When Returns Are NOT Accepted */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  When Returns Are NOT Accepted
                </h2>
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Change of Mind</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      We do not accept returns for change of mind, wrong size selection, or personal preferences as our products are perishable.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Delayed Reporting</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Issues must be reported within 2 hours of delivery. Delayed complaints cannot be entertained due to the perishable nature of our products.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">Opened/Consumed Products</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Products that have been opened, partially consumed, or tampered with cannot be returned for hygiene and safety reasons.
                    </p>
                  </div>
                </div>
              </section>

              {/* Return Process */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Return Process
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Report Immediately</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Contact us within 2 hours of delivery via WhatsApp (+91 8837284911) or email (tayaima.com@gmail.com)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Provide Details</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Share order number, photos of damaged items, and delivery details</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Review & Resolution</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">We'll review your case and provide refund or replacement within 24-48 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  Need Help?
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><strong>WhatsApp:</strong> +91 8837284911</p>
                        <p><strong>Email:</strong> tayaima.com@gmail.com</p>
                        <p><strong>Business Hours:</strong> 6:00 AM - 10:00 PM (Daily)</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Response</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        For immediate assistance, WhatsApp is the fastest way to reach us. 
                        We typically respond within 30 minutes during business hours.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Policy Updates */}
              <section>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} | 
                    This policy may be updated from time to time. Please check back regularly for any changes.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
