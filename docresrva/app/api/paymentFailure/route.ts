import { redirect } from "next/navigation";

export async function POST(req: any) {
    console.log('hai')
  console.log('reached failure');
  
  const contentType = req.headers.get("content-type") || "";

  const formData = await req.formData();

  const data: { [key: string]: any } = {};
  formData.forEach((value: any, key: string) => {
    data[key] = value;
  });
  const { productinfo } = data;
console.log(productinfo);

  const redirectUrl = `/user/paymentFailurePage`;
  redirect(redirectUrl);
}