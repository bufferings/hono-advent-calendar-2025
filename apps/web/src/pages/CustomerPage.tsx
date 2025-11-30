import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type Order,
  useGetApiOrders,
  usePostApiOrders,
} from "../api/generated";
import { useOrderEvents } from "../hooks/useOrderEvents.ts";
import { clsx } from "clsx";

export default function CustomerPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = parseInt(searchParams.get("table") || "1", 10);

  const [itemName, setItemName] = useState("まぐろ");
  const [quantity, setQuantity] = useState(1);

  // SSE Connection
  useOrderEvents(tableNumber);

  // Fetch Orders
  const { data } = useGetApiOrders({ tableNumber });
  const orders = data?.orders ?? [];

  // Create Order Mutation
  const createOrderMutation = usePostApiOrders();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate({
      data: { tableNumber, itemName, quantity },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">🍣 テーブル {tableNumber}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-800 px-2 py-1 rounded">
              リアルタイム: ●
            </span>
          </div>
        </div>

        {/* Order Form */}
        <div className="p-4 border-b">
          <h2 className="font-bold mb-2">ご注文</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                className="border rounded p-2 flex-grow"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              >
                <option value="まぐろ">まぐろ</option>
                <option value="サーモン">サーモン</option>
                <option value="えび">えび</option>
                <option value="いくら">いくら</option>
                <option value="うに">うに</option>
              </select>
              <select
                className="border rounded p-2 w-20"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="bg-red-500 text-white p-2 rounded font-bold hover:bg-red-600 disabled:bg-gray-400"
            >
              {createOrderMutation.isPending ? "注文中..." : "注文する"}
            </button>
          </form>
        </div>

        {/* Order List */}
        <div className="p-4">
          <h2 className="font-bold mb-2">ご注文状況</h2>
          <div className="space-y-2">
            {orders.length === 0 && (
              <p className="text-gray-500 text-sm">まだ注文がありません。</p>
            )}
            {orders.map((order) => <OrderItem key={order.id} order={order} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderItem({ order }: { order: Order }) {
  return (
    <div className="border rounded p-3 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
            #{order.orderNumber}
          </span>
        </div>
        <div className="font-bold text-lg">
          {order.itemName} ×{order.quantity}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleTimeString()}
        </div>
      </div>
      <div
        className={clsx(
          "font-bold text-sm px-3 py-1 rounded",
          order.status === "ordered" && "bg-gray-200 text-gray-700",
          order.status === "cooking" &&
            "bg-orange-100 text-orange-700 animate-pulse",
          order.status === "delivered" && "bg-green-100 text-green-700",
        )}
      >
        {order.status === "ordered" && "📝 注文受付"}
        {order.status === "cooking" && "🔥 調理中..."}
        {order.status === "delivered" && "✅ お届け完了！"}
      </div>
    </div>
  );
}
