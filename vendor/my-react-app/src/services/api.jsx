import * as vendorService from "./vendorService";

export const vendorAPI = {
  saveVendorStep: vendorService.saveVendorStep,
  getMyVendor: vendorService.getMyVendor,
  submitVendor: vendorService.submitVendor,
};
