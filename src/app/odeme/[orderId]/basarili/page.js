import { OrderResultPageShell } from "@/components/payments/order-result-page";

export const metadata = {
  title: "Ödeme Başarılı",
};

export default async function OrderSuccessPage({ params }) {
  const { orderId } = await params;

  return <OrderResultPageShell orderId={orderId} variant="success" />;
}
