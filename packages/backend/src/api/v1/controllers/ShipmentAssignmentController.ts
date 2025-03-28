import { Request, Response } from 'express';
import { ShipmentAssignmentStatus } from '../../../domain/entities/ShipmentAssignment';
import { ShipmentAssignmentService } from '../../../services/ShipmentAssignmentService';

export class ShipmentAssignmentController {
  private shipmentAssignmentService: ShipmentAssignmentService;

  constructor(shipmentAssignmentService: ShipmentAssignmentService) {
    this.shipmentAssignmentService = shipmentAssignmentService;
  }

  async assign(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentId, routeId, driverId } = req.body;
      
      
      const assignment = await this.shipmentAssignmentService.assignShipment({
        shipment_id: shipmentId,
        route_id: routeId,
        driver_id: driverId
      });
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error al asignar el envío:', error);
      res.status(400).json({ error: error.message || 'Fallo al asignar el envío' });
    }
  }
  
  async getAssignments(req: Request, res: Response): Promise<void> {
    try {
      
      const status = req.query.status as ShipmentAssignmentStatus;
      const assignments = await this.shipmentAssignmentService.getShipmentAssignments(status);
      
      res.status(200).json(assignments);
    } catch (error) {
      console.error('Error al obtener las asignaciones:', error);
      res.status(500).json({ error: 'Fallo al obtener las asignaciones' });
    }
  }
  
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      
      if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'No tienes permiso para actualizar el estado de las asignaciones' });
        return;
      }
      
      await this.shipmentAssignmentService.updateAssignmentStatus(parseInt(id), status);
      
      res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Fallo al actualizar el estado' });
    }
  }
}