import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentRepository } from '../repositories/ShipmentRepository';
import { MailerService } from '../infrastructure/email/email';

export class ShipmentService {
  private shipmentRepository: ShipmentRepository;
  private mailerService: MailerService;

  constructor(shipmentRepository:ShipmentRepository,mailerService : MailerService) {
    this.shipmentRepository = shipmentRepository;
    this.mailerService = mailerService;
  }

  async createShipment(shipment: Shipment): Promise<Shipment | null> {
    const newShipment = await this.shipmentRepository.create(shipment);
    if (!newShipment) return null;    
    return newShipment;
  }

  async find(id: number): Promise<Shipment | null> {
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) return null;
    return shipment;
  }
}