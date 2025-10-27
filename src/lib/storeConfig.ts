/**
 * Store Configuration for Pickup Orders
 * 
 * This file contains all the store information that will be displayed
 * to customers who choose the "Pick up from Store" option.
 */

export const STORE_CONFIG = {
  name: "TaYaima Store",
  address: {
    line1: "Thangmeiband polem leikai",
    line2: "Tayaima dukan, near panthoibi",
    city: "Imphal West",
    state: "Manipur",
    pincode: "795001",
    fullAddress: "Thangmeiband polem leikai, Tayaima dukan, near panthoibi, Imphal West, Manipur - 795001"
  },
  contact: {
    phone: "+918837284911",
    whatsapp: "+918837284911",
    email: "store@tayaima.com",
  },
  hours: {
    weekdays: {
      open: "06:00 AM",
      close: "10:00 PM",
      days: "Monday to Sunday"
    },
    saturday: {
      open: "06:00 AM",
      close: "10:00 PM",
      days: "Monday to Sunday"
    },
    sunday: {
      open: "06:00 AM",
      close: "10:00 PM",
      days: "Monday to Sunday"
    }
  },
  pickupInstructions: [
    "ℹ️ Please bring your Order ID when picking up your order"
  ],
  mapLink: "https://maps.google.com/?q=Imphal+Manipur",
};

export const getStoreHoursDisplay = () => {
  return ["Monday to Sunday: 06:00 AM - 10:00 PM"];
};

export const getStoreContactDisplay = () => {
  const { phone, email } = STORE_CONFIG.contact;
  return {
    phone,
    email,
    whatsappLink: `https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`
  };
};

