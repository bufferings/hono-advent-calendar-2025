import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, startCooking, deliverOrder, Order } from "../api/client.ts";
import { useOrderEvents } from "../hooks/useOrderEvents.ts";

export default function KitchenPage() {
  const queryClient = useQueryClient();

  // SSE Connection (ALL tables)
  useOrderEvents();

  // Fetch Orders
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
  });

  // Mutations
  const startCookingMutation = useMutation({
    mutationFn: startCooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const deliverOrderMutation = useMutation({
    mutationFn: deliverOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const orderedList = orders.filter((o) => o.status === "ordered");
  const cookingList = orders.filter((o) => o.status === "cooking");

  return (
    <div className="min-h-screen bg-gray-800 p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🍣 厨房ダッシュボード</h1>
          <span className="text-xs bg-green-600 px-2 py-1 rounded">リアルタイム: ●</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Orders */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📥 新規注文</span>
              <span className="bg-red-500 text-xs px-2 py-1 rounded-full">{orderedList.length}</span>
            </h2>
            <div className="space-y-3">
              {orderedList.length === 0 && <p className="text-gray-400">新規注文はありません</p>}
              {orderedList.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actionLabel="調理開始"
                  onAction={() => startCookingMutation.mutate(order.id)}
                  color="blue"
                />
              ))}
            </div>
          </div>

          {/* Cooking */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🔥 調理中</span>
              <span className="bg-orange-500 text-xs px-2 py-1 rounded-full">{cookingList.length}</span>
            </h2>
            <div className="space-y-3">
              {cookingList.length === 0 && <p className="text-gray-400">調理中の注文はありません</p>}
              {cookingList.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actionLabel="配膳完了"
                  onAction={() => deliverOrderMutation.mutate(order.id)}
                  color="green"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, actionLabel, onAction, color }: { order: Order, actionLabel: string, onAction: () => void, color: "blue" | "green" }) {
  const colorClass = color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700";
  
  return (
    <div className="bg-gray-600 rounded p-3 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-gray-500 px-2 py-0.5 rounded text-xs font-bold">#{order.orderNumber}</span>
          <span className="bg-gray-500 px-2 py-0.5 rounded text-xs font-bold">T-{order.tableNumber}</span>
          <span className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="text-lg font-bold">
          {order.itemName} <span className="text-yellow-400">×{order.quantity}</span>
        </div>
      </div>
      <button
        onClick={onAction}
        className={`${colorClass} text-white px-4 py-2 rounded font-bold shadow-lg transition-colors`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
