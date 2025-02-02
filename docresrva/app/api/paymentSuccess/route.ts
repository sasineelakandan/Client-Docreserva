
import axiosInstance from "@/components/utils/axiosInstence";
import axios from "axios";
import { redirect } from "next/navigation";

export async function POST(req: Request, { params }: { params: Promise<{ productinfo: string }> }) {
  console.log('reached success');
  
  const contentType = req.headers.get("content-type") || "";

  const formData = await req.formData();

  const data: { [key: string]: any } = {};
  formData.forEach((value: any, key: string) => {
    data[key] = value;
  });
  

  let response = await axios.patch(`${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/bookings`, data, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  
  const redirectUrl = `/paymentSuccessPage?transactionId=${data.txnid}&amountPaid=${data.amount}&bankRefNum=${data.bank_ref_num}`;

  redirect(redirectUrl);
}