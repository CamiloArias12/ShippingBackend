import { Request, Response } from 'express';
import { ShipmentService } from '../../../services/ShipmentService';

export class ShipmentController {
  private shipmentService: ShipmentService;

  constructor(shipmentService: ShipmentService) {
    this.shipmentService = shipmentService;
  }

  async create(req: Request, res: Response): Promise<void> {

    /*
    const validation = ShipmentReq.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Datos inválidos', validation });
      return;
    }
    */
    try {
      const result = await this.shipmentService.createShipment( req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear el envío:', error);
      res.status(500).json({ error: 'Fallo al registrar el envío' });
    }
  }
}