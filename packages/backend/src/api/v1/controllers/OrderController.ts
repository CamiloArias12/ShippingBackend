import { Request, Response } from 'express';
import { OrderService } from '../../../services/OrderService';
import { OrderStatus } from '../../../domain/entities/Order';
import { logger } from '../../../utils/Logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - shippingAddress
 *         - productName
 *         - price
 *         - quantity
 *       properties:
 *         shippingAddress:
 *           type: string
 *           example: "123 Main St"
 *         city:
 *           type: string
 *           example: "New York"
 *         zipCode:
 *           type: string
 *           example: "10001"
 *         country:
 *           type: string
 *           example: "USA"
 *         productName:
 *           type: string
 *           example: "Product Name"
 *         price:
 *           type: number
 *           format: float
 *           example: 19.99
 *         quantity:
 *           type: integer
 *           example: 2
 */

export class OrderController {
    private orderService = new OrderService();

    /**
     * @swagger
     * /api/v1/orders:
     *   post:
     *     summary: Create a new order
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateOrder'
     *     responses:
     *       201:
     *         description: Order created successfully
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            
            const orderData = {
                userId,
                ...req.body
            };
            
            const order = await this.orderService.createOrder(orderData);
            res.status(201).json(order);
        } catch (error) {
            logger.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    }

    /**
     * @swagger
     * /api/v1/orders:
     *   get:
     *     summary: Get all orders for authenticated user
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of orders
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    async getUserOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            
            const orders = await this.orderService.getUserOrders(userId);
            res.status(200).json(orders);
        } catch (error) {
            logger.error('Error fetching user orders:', error);
            res.status(500).json({ error: 'Failed to retrieve orders' });
        }
    }

    /**
     * @swagger
     * /api/v1/orders/{id}:
     *   get:
     *     summary: Get order by ID
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Order details
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Order not found
     *       500:
     *         description: Server error
     */
    async getOrderById(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            const userRole = (req.user as any)?.role;
            const orderId = parseInt(req.params.id);
            
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            
            // Only allow users to access their own orders unless they're admin
            if (order.userId !== userId && userRole !== 'admin') {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            
            res.status(200).json(order);
        } catch (error) {
            logger.error('Error fetching order:', error);
            res.status(500).json({ error: 'Failed to retrieve order' });
        }
    }

    /**
     * @swagger
     * /api/v1/orders/{id}/status:
     *   patch:
     *     summary: Update order status
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [pending, processing, shipped, delivered, cancelled]
     *     responses:
     *       200:
     *         description: Order status updated
     *       400:
     *         description: Invalid status
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Order not found
     *       500:
     *         description: Server error
     */
    async updateOrderStatus(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req.user as any)?.role;
            const orderId = parseInt(req.params.id);
            const { status } = req.body;
            
            // Only allow admins or drivers to update order status
            if (userRole !== 'admin' && userRole !== 'driver') {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            
            // Validate status
            if (!Object.values(OrderStatus).includes(status)) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            
            const order = await this.orderService.updateOrderStatus(orderId, status);
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            
            res.status(200).json(order);
        } catch (error) {
            logger.error('Error updating order status:', error);
            res.status(500).json({ error: 'Failed to update order status' });
        }
    }
}