import { PaymentCheckoutPage } from "@/components/payments/payment-checkout";

export const metadata = {
  title: "Ödeme | Sümeyra Aydın Akademi & Danışmanlık",
};

export default async function OrderPaymentPage({ params }) {
  const { orderId } = await params;
  return <PaymentCheckoutPage orderId={orderId} />;
}
