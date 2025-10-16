"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { IconCheck, IconBuildingStore, IconUsers, IconShield, IconTruck, IconPhone, IconMail, IconMapPin } from "@tabler/icons-react";

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    productCategory: "",
    experience: "",
    location: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Sell Request - ${formData.businessName}`,
          message: `
Business Name: ${formData.businessName}
Business Type: ${formData.businessType}
Product Category: ${formData.productCategory}
Experience: ${formData.experience}
Location: ${formData.location}

Message: ${formData.message}
          `
        }),
      });

      if (response.ok) {
        toast.success('Your sell request has been submitted successfully! We will contact you soon.');
        setFormData({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          businessType: "",
          productCategory: "",
          experience: "",
          location: "",
          message: ""
        });
      } else {
        toast.error('Failed to submit your request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <IconBuildingStore className="w-8 h-8 text-green-600" />,
      title: "Wide Customer Base",
      description: "Reach thousands of customers across India with our established platform"
    },
    {
      icon: <IconUsers className="w-8 h-8 text-blue-600" />,
      title: "Trusted Platform",
      description: "Join a trusted family store with a strong reputation for quality and service"
    },
    {
      icon: <IconShield className="w-8 h-8 text-purple-600" />,
      title: "Secure Payments",
      description: "Get paid securely and on time with our reliable payment system"
    },
    {
      icon: <IconTruck className="w-8 h-8 text-orange-600" />,
      title: "Logistics Support",
      description: "We handle packaging, shipping, and delivery to your customers"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Submit Application",
      description: "Fill out our seller application form with your business details"
    },
    {
      step: "2", 
      title: "Product Review",
      description: "Our team will review your products for quality and compliance"
    },
    {
      step: "3",
      title: "Onboarding",
      description: "Complete the onboarding process and set up your seller account"
    },
    {
      step: "4",
      title: "Start Selling",
      description: "List your products and start reaching customers across India"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Image
                src="/tayaima-logo.jpeg"
                alt="TaYaima Logo"
                width={80}
                height={80}
                className="rounded-lg object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Sell Through <span className="text-green-600">TaYaima</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Join India's trusted family store and reach customers across the country. 
              We provide a platform for quality sellers to grow their business.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-green-600" />
                <span>Quality Assurance</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-green-600" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-green-600" />
                <span>Logistics Support</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-green-600" />
                <span>Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose TaYaima?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide everything you need to succeed as a seller on our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple steps to start selling on TaYaima
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Fill out the form below and our team will get back to you within 24 hours
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <IconPhone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <a href="tel:+918837284911" className="text-gray-900 dark:text-white hover:text-green-600 transition-colors">
                        +91 8837284911
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <IconMail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <a href="mailto:tayaima.com@gmail.com" className="text-gray-900 dark:text-white hover:text-green-600 transition-colors">
                        tayaima.com@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <IconMapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">
                        Thangmeiband Polem Leikai<br />
                        Manipur, India
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What We Look For
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Quality products with proper certifications</li>
                    <li>• Reliable suppliers and consistent inventory</li>
                    <li>• Competitive pricing and fair terms</li>
                    <li>• Good business practices and compliance</li>
                  </ul>
                </div>
              </div>
              
              {/* Form */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        required
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Business Type</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Category *
                      </label>
                      <select
                        id="productCategory"
                        name="productCategory"
                        required
                        value={formData.productCategory}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Fresh Vegetables">Fresh Vegetables</option>
                        <option value="Fresh Fruits">Fresh Fruits</option>
                        <option value="Dairy Products">Dairy Products</option>
                        <option value="Grains & Pulses">Grains & Pulses</option>
                        <option value="Spices & Condiments">Spices & Condiments</option>
                        <option value="Household Items">Household Items</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        required
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Experience</option>
                        <option value="Less than 1 year">Less than 1 year</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="More than 10 years">More than 10 years</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your products, business, or any specific requirements..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
