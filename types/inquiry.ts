/**
 * Partner enquiries from the public "work with us" form.
 */

export type InquiryStatus = "PENDING" | "CONTACTED" | "RESOLVED";
export type FreightType = "ROAD" | "SEA" | "AIR";

export interface Inquiry {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  freightTypes: FreightType[];
  description: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryFilters {
  status?: InquiryStatus;
  freightType?: FreightType;
  search?: string;
  page: number;
  limit: number;
}
