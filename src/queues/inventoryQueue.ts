import { Queue, Worker, Job } from 'bullmq';
import { bullmqRedis } from '../config/redis'; // ← changed import

export const inventoryQueue = new Queue('inventory', {
  connection: bullmqRedis, // ← bullmqRedis, not redis
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

type LowStockPayload     = { productId: string; productName: string; quantity: number };
type OrderConfirmPayload = { orderId: string; userId: string; totalAmount: number };

export const startWorker = () => {
  const worker = new Worker(
    'inventory',
    async (job: Job) => {
      switch (job.name) {
        case 'low-stock-alert': {
          const { productId, productName, quantity } = job.data as LowStockPayload;
          console.log(`[ALERT] Low stock: "${productName}" (ID: ${productId}) — ${quantity} units left`);
          break;
        }
        case 'order-confirmation': {
          const { orderId, userId, totalAmount } = job.data as OrderConfirmPayload;
          console.log(`[ORDER] Confirmed: ${orderId} for user ${userId}, total ₹${totalAmount}`);
          break;
        }
        default:
          console.warn(`[WORKER] Unknown job: ${job.name}`);
      }
    },
    {
      connection: bullmqRedis, // ← bullmqRedis here too
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => console.log(`[WORKER] Done: ${job.name} (${job.id})`));
  worker.on('failed', (job, err) => console.error(`[WORKER] Failed: ${job?.name} — ${err.message}`));

  return worker;
};