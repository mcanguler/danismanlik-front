import { OrderResultPageShell } from "@/components/payments/order-result-page";

export const metadata = {
  title: "Ödeme Tamamlanamadı",
};

export default async function OrderFailedPage({ params }) {
  const { orderId } = await params;

  return <OrderResultPageShell orderId={orderId} variant="failed" />;
}
